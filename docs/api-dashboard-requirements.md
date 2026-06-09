# Herycia — APIs Dashboard (besoins frontend)

Document de spécification pour l’équipe backend : endpoints nécessaires pour alimenter le **dashboard backoffice** (`/dashboard`) sans données mockées.

> **Préfixe** : `{VITE_API_URL}/api/v1`  
> **Auth** : `Authorization: Bearer {access_token}`  
> **Scope** : salon déduit du JWT (pas de `salon_id` en query)  
> **Enveloppe** : identique au reste du backoffice (`success`, `message`, `data`)

---

## 1. État actuel

### Déjà disponible et utilisé

| Besoin UI | Endpoint existant | Suffisant ? |
|-----------|-------------------|-------------|
| Recettes jour / semaine / mois (totaux) | `GET /payments/summary` | Oui pour **4 cartes KPI** partielles |
| RDV du jour (compte + statuts) | `GET /appointments?date=YYYY-MM-DD` | Oui pour **comptes**, pas pour **tendances** |

### Encore en mock côté front

| Composant Vue | Fichier mock |
|---------------|--------------|
| Cartes KPI (tendances + file + clients actifs) | `dashboard.mock.ts` → `dashboardMetrics` |
| Graphique « Évolution des clients » | `clientsEvolutionData` |
| Graphique « Évolution des recettes » | `revenueEvolutionData` |
| Panneau « File d'attente » | `queueWaitingMock` |
| Timeline « Activité récente » | `activityLogsMock` |

---

## 2. Conventions de réponse

### Succès

```json
{
  "success": true,
  "message": "Données du tableau de bord récupérées avec succès",
  "data": { }
}
```

### Point de série (graphiques en barres)

Structure commune utilisée par `SimpleBarChart` :

```json
{
  "label": "Jan",
  "value": 18
}
```

- `label` : libellé axe X (jour, semaine, mois, année)
- `value` : entier ≥ 0 (nombre de clients ou montant FCFA)

### Métrique avec tendance (cartes KPI)

```json
{
  "value": 12,
  "trend": 3,
  "trend_percent": 18.5
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `value` | number | Valeur affichée |
| `trend` | number \| null | Delta absolu vs période précédente (ex. +3 RDV) |
| `trend_percent` | number \| null | Variation en % (ex. +18.5 % recettes) |

Le front affiche `trend` ou `trend_percent` selon la carte (comme aujourd’hui en mock).

---

## 3. APIs recommandées

Deux approches possibles. **Recommandation : Option B** (endpoints séparés, cache et évolutions plus simples).

---

### Option A — Un seul endpoint agrégé

#### `GET /dashboard`

Retourne tout le dashboard en un appel.

**Query (optionnel)**

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `date` | `YYYY-MM-DD` | aujourd’hui | Jour de référence pour overview / file |

**Réponse `data`**

```json
{
  "overview": {
    "appointments_today": { "value": 12, "trend": 3, "trend_percent": null },
    "revenue_today": { "value": 42500, "trend": null, "trend_percent": 18 },
    "active_clients": { "value": 248, "trend": 12, "trend_percent": 5.1 },
    "queue_waiting": { "value": 5, "trend": -2, "trend_percent": null }
  },
  "clients_chart": {
    "month": [{ "label": "Jan", "value": 18 }],
    "year": [{ "label": "2024", "value": 210 }]
  },
  "revenue_chart": {
    "day": [{ "label": "Lun", "value": 32000 }],
    "week": [{ "label": "S1", "value": 185000 }],
    "month": [{ "label": "Jan", "value": 820000 }],
    "year": [{ "label": "2025", "value": 14200000 }]
  },
  "revenue_totals": {
    "day": 42500,
    "week": 838000,
    "month": 6060000
  },
  "queue": [
    {
      "id": "uuid",
      "position": 1,
      "client_name": "Koffi Atta",
      "service_name": "Coupe homme",
      "wait_minutes": 12
    }
  ],
  "activity": [
    {
      "id": "uuid",
      "type": "appointment",
      "message": "RDV confirmé — Koffi Atta · Coupe homme à 10h00",
      "created_at": "2026-06-03T09:55:00+00:00"
    }
  ]
}
```

---

### Option B — Endpoints ciblés (recommandé)

#### 3.1 `GET /dashboard/overview`

**Rôle** : 4 cartes métriques en haut du dashboard.

**Query**

| Param | Type | Description |
|-------|------|-------------|
| `date` | `YYYY-MM-DD` | Jour de référence (défaut : aujourd’hui) |

**Réponse `data`**

```json
{
  "appointments_today": {
    "value": 12,
    "trend": 3,
    "trend_percent": null
  },
  "revenue_today": {
    "value": 42500,
    "trend": null,
    "trend_percent": 18.0
  },
  "active_clients": {
    "value": 248,
    "trend": 12,
    "trend_percent": 5.1
  },
  "queue_waiting": {
    "value": 5,
    "trend": -2,
    "trend_percent": null
  }
}
```

**Règles métier suggérées**

| Métrique | Calcul |
|----------|--------|
| `appointments_today` | RDV `scheduled_at` sur `date`, tous statuts sauf `cancelled` |
| `revenue_today` | Somme paiements `status=paid` sur `date` |
| `active_clients` | Clients avec `last_visit_at` dans les 30 derniers jours (ou `total_visits > 0` sur période) |
| `queue_waiting` | Entrées file `status=waiting` (voir § 3.5) |
| `trend` / `trend_percent` | Comparaison avec la veille / semaine précédente / mois précédent selon la métrique |

**Alternative sans tendance** : le front peut vivre avec `trend: null` au début.

---

#### 3.2 `GET /dashboard/clients-stats`

**Rôle** : graphique « Évolution des clients » (onglets Mois / Année).

**Query**

| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `period` | `month` \| `year` | oui | Granularité des barres |

**Réponse `data`**

```json
{
  "period": "month",
  "points": [
    { "label": "Jan", "value": 18 },
    { "label": "Fév", "value": 22 },
    { "label": "Mar", "value": 28 }
  ],
  "total": 248,
  "trend_percent": 12.0
}
```

| Champ | Description |
|-------|-------------|
| `points` | 12 barres si `period=month` (mois courants de l’année), N barres si `period=year` (années) |
| `total` | Total clients actifs ou créés (à préciser côté produit) |
| `trend_percent` | Variation vs période précédente (optionnel, affiché sous le graphique) |

**Règle métier suggérée** : compter les **nouveaux clients** (`clients.created_at`) par bucket mois/année, pas la liste paginée `GET /clients`.

---

#### 3.3 `GET /dashboard/revenue-stats`

**Rôle** : graphique « Évolution des recettes » (onglets Jour / Semaine / Mois / Année).

**Query**

| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `period` | `day` \| `week` \| `month` \| `year` | oui | Granularité |

**Réponse `data`**

```json
{
  "period": "week",
  "points": [
    { "label": "S1", "value": 185000 },
    { "label": "S2", "value": 210000 },
    { "label": "S3", "value": 198000 },
    { "label": "S4", "value": 245000 }
  ],
  "total": 838000,
  "trend_percent": 18.0
}
```

| `period` | Nombre de points attendu | Exemple `label` |
|----------|-------------------------|-----------------|
| `day` | 7 | Lun … Dim (semaine courante) |
| `week` | 4–5 | S1 … S4 (mois courant) |
| `month` | 12 | Jan … Déc (année courante) |
| `year` | 3–5 | 2024, 2025, 2026 |

**Règle métier** : somme `payments.amount` où `status = paid`, groupée par bucket temporel.

> **Note** : `GET /payments/summary` ne remplace pas cet endpoint (il ne fournit qu’un total par fenêtre, pas une série).

---

#### 3.4 `GET /dashboard/activity`

**Rôle** : timeline « Activité récente » (droite du dashboard).

**Query**

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `limit` | int | 20 | Nombre max d’événements |

**Réponse `data`**

```json
[
  {
    "id": "uuid",
    "type": "appointment",
    "message": "RDV confirmé — Koffi Atta · Coupe homme à 10h00",
    "created_at": "2026-06-03T09:55:00+00:00"
  },
  {
    "id": "uuid",
    "type": "payment",
    "message": "Paiement reçu — 8 500 F · Orange Money",
    "created_at": "2026-06-03T09:42:00+00:00"
  },
  {
    "id": "uuid",
    "type": "client",
    "message": "Nouveau client — Fatou Traoré",
    "created_at": "2026-06-03T08:30:00+00:00"
  },
  {
    "id": "uuid",
    "type": "queue",
    "message": "Awa Diallo ajoutée à la file d'attente",
    "created_at": "2026-06-03T08:15:00+00:00"
  },
  {
    "id": "uuid",
    "type": "system",
    "message": "3 coiffeurs connectés sur la file live",
    "created_at": "2026-06-03T07:00:00+00:00"
  }
]
```

**Enum `type`**

| Valeur | Icône front | Source suggérée |
|--------|-------------|-----------------|
| `appointment` | Calendrier | création / confirmation / changement statut RDV |
| `payment` | Caisse | `POST /payments` |
| `client` | Utilisateur | `POST /clients` |
| `queue` | File | entrée file d’attente |
| `system` | Cloche | événements salon (optionnel) |

Le front formate `created_at` en texte relatif (« Il y a 5 min ») via `Intl` / helper local.

**Implémentation back** : table `activity_logs` ou vue SQL union des dernières actions.

---

#### 3.5 `GET /queue` (ou `GET /dashboard/queue`)

**Rôle** : panneau « File d'attente » — 5 prochains clients.

**Non documenté** dans l’API backoffice actuelle. Requis si la page `/queue` et le widget dashboard doivent être réels.

**Query**

| Param | Type | Défaut |
|-------|------|--------|
| `limit` | int | 5 |

**Réponse `data`**

```json
[
  {
    "id": "uuid",
    "position": 1,
    "client_name": "Koffi Atta",
    "service_name": "Coupe homme",
    "wait_minutes": 12,
    "status": "waiting"
  }
]
```

| Champ | Type | Description |
|-------|------|-------------|
| `position` | int | Ordre dans la file |
| `wait_minutes` | int | Temps d’attente estimé ou réel |
| `status` | `waiting` \| `called` | Enum file |

**Tri** : `position` ASC, `limit` premiers.

---

## 4. Mapping composants Vue → endpoints

| Composant | Endpoint(s) Option B |
|-----------|----------------------|
| `DashboardMetricCard` ×4 | `GET /dashboard/overview` |
| `ClientsEvolutionCard` | `GET /dashboard/clients-stats?period=month` et `period=year` |
| `RevenueEvolutionCard` | `GET /dashboard/revenue-stats?period=day\|week\|month\|year` |
| `QueueWaitingCard` | `GET /queue?limit=5` |
| `ActivityLogsCard` | `GET /dashboard/activity?limit=20` |

**Chargement front suggéré** (parallèle) :

```
GET /dashboard/overview
GET /dashboard/clients-stats?period=month
GET /dashboard/clients-stats?period=year
GET /dashboard/revenue-stats?period=week   // onglet par défaut
GET /queue?limit=5
GET /dashboard/activity?limit=20
```

Ou lazy-load des graphiques au changement d’onglet (`period`).

---

## 5. Complément : `GET /payments/summary` (existant)

Déjà intégré pour les cartes **Paiements** (`/payments`) et partiellement le dashboard.

```json
{
  "success": true,
  "message": "...",
  "data": {
    "day":   { "from": "2026-06-03", "to": "2026-06-03", "total": 15000, "count": 5 },
    "week":  { "from": "2026-06-02", "to": "2026-06-08", "total": 42000, "count": 12 },
    "month": { "from": "2026-06-01", "to": "2026-06-30", "total": 120000, "count": 45 }
  }
}
```

Peut rester pour la page Caisse ; le graphique recettes doit utiliser **`/dashboard/revenue-stats`** (séries), pas ce endpoint seul.

---

## 6. Priorisation livraison

| Priorité | Endpoint | Impact |
|----------|----------|--------|
| P0 | `GET /dashboard/revenue-stats` | Graphique recettes |
| P0 | `GET /dashboard/clients-stats` | Graphique clients |
| P1 | `GET /dashboard/overview` | KPI + tendances |
| P1 | `GET /dashboard/activity` | Timeline |
| P2 | `GET /queue` | File + widget file |

**MVP dashboard** : P0 + `overview` sans tendances (`trend: null`).

---

## 7. Erreurs & permissions

- Mêmes codes que le reste du backoffice : `401`, `403` (`subscription_*`), `422`.
- Rôles : tous les rôles avec accès dashboard (`admin`, `manager`, `stylist`, `receptionist`) sauf restriction produit sur `payments/summary` (admin only côté doc actuelle — à aligner).
- Pas de donnée d’un autre salon (scope JWT).

---

## 8. Types TypeScript front (référence)

Le front créera dans `src/types/dashboard.ts` :

```ts
export interface DashboardMetric {
  value: number
  trend: number | null
  trend_percent: number | null
}

export interface ChartPoint {
  label: string
  value: number
}

export interface ClientsStats {
  period: 'month' | 'year'
  points: ChartPoint[]
  total: number
  trend_percent: number | null
}

export interface RevenueStats {
  period: 'day' | 'week' | 'month' | 'year'
  points: ChartPoint[]
  total: number
  trend_percent: number | null
}

export interface DashboardOverview {
  appointments_today: DashboardMetric
  revenue_today: DashboardMetric
  active_clients: DashboardMetric
  queue_waiting: DashboardMetric
}

export type ActivityType = 'appointment' | 'payment' | 'client' | 'queue' | 'system'

export interface ActivityLog {
  id: string
  type: ActivityType
  message: string
  created_at: string
}

export interface QueueEntry {
  id: string
  position: number
  client_name: string
  service_name: string
  wait_minutes: number
  status: 'waiting' | 'called'
}
```

---

*Document généré pour `herycia-frontend` — dashboard `DashboardView.vue` et composants `src/components/dashboard/*`.*
