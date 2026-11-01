# Déploiement du front sur le VPS

Chaque push sur `main` déclenche `.github/workflows/deploy.yml` :

1. **Vérifications** : la CI complète (type-check, tests, lint, build). Si elle échoue, rien n'est envoyé.
2. **Build de production** avec `VITE_API_URL` et `VITE_SITE_URL`.
3. **Envoi** de la version dans `releases/<date>-<commit>/` sur le VPS (rsync par SSH).
4. **Bascule atomique** du lien `current` vers cette version : pas de site à moitié copié.
5. **Contrôle** : le workflow lit `https://<site>/version.json` et échoue si la nouvelle version n'est pas servie.

Les 5 dernières versions restent sur le serveur. **Retour arrière** : onglet *Actions* → *Déploiement VPS* →
*Run workflow* → action `rollback` (réactive la version précédente en une seconde).

```
/var/www/manyan-front/
├── current -> releases/20261101183000-a1b2c3d
└── releases/
    ├── 20261031120000-9f8e7d6/
    └── 20261101183000-a1b2c3d/
```

## 1. Préparer le VPS (une seule fois)

Exemple pour Ubuntu/Debian, en root :

```bash
# Utilisateur dédié au déploiement, sans mot de passe
adduser --disabled-password --gecos "" deploy

# Dossier du site : écrit par deploy, lu par nginx
mkdir -p /var/www/manyan-front/releases
chown -R deploy:www-data /var/www/manyan-front
chmod -R 755 /var/www/manyan-front

# nginx + certificat HTTPS
apt install -y nginx rsync certbot python3-certbot-nginx
cp nginx.conf.example /etc/nginx/sites-available/manyan-front   # adapter le domaine
ln -s /etc/nginx/sites-available/manyan-front /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d exemple.ci -d www.exemple.ci
```

## 2. Clé SSH de déploiement

Sur votre ordinateur (pas sur le VPS) :

```bash
ssh-keygen -t ed25519 -C "github-deploy-manyan" -f manyan_deploy -N ""
```

- Contenu de `manyan_deploy.pub` → à ajouter dans `/home/deploy/.ssh/authorized_keys` sur le VPS
  (dossier `.ssh` en 700, fichier en 600, propriétaire `deploy`).
- Contenu de `manyan_deploy` (clé privée) → secret GitHub `VPS_SSH_KEY`, puis supprimer le fichier local.

Empreinte du serveur, pour que GitHub vérifie qu'il parle bien à **votre** VPS :

```bash
ssh-keyscan -p 22 votre-ip-ou-domaine
```

Comparez l'empreinte avec celle du serveur (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` sur le VPS),
puis collez la sortie de `ssh-keyscan` dans le secret `VPS_KNOWN_HOSTS`.

## 3. Configurer GitHub

**Variables du dépôt** : *Settings → Secrets and variables → Actions → Variables*

| Variable | Exemple | Obligatoire |
|---|---|---|
| `VITE_API_URL` | `https://api.exemple.ci/api` | oui |
| `VITE_SITE_URL` | `https://exemple.ci` | recommandé (SEO, contrôle de version) |
| `VPS_PATH` | `/var/www/manyan-front` | non (valeur par défaut) |
| `VPS_PORT` | `22` | non (valeur par défaut) |

**Secrets de l'environnement `production`** : *Settings → Environments → New environment → production*

| Secret | Contenu |
|---|---|
| `VPS_HOST` | IP ou nom du VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | clé privée `manyan_deploy` |
| `VPS_KNOWN_HOSTS` | sortie de `ssh-keyscan` |

Dans l'environnement `production`, vous pouvez aussi limiter le déploiement à la branche `main`
(*Deployment branches*) et exiger une validation manuelle (*Required reviewers*).

## 4. Premier déploiement

```bash
git checkout -b main origin/dev
git push -u origin main
```

Suivez l'exécution dans l'onglet *Actions*. Ensuite, chaque fusion dans `main` met le site à jour.

## Côté backend

Ajoutez l'adresse du front dans `CORS_ALLOWED_ORIGINS` et `FRONTEND_URL` du backend
(ex. `https://exemple.ci`), sinon le navigateur bloquera les appels à l'API.
