import type { PublicPlan } from '@/types/plan'

/**
 * Copie des offres publiques du backend (PlanSeeder + PlanFeatureCatalog), affichée sur la
 * page d'accueil tant que l'API ne répond pas : la section Tarifs ne reste jamais vide.
 * À tenir à jour si les offres changent côté backend.
 */
export const FALLBACK_PUBLIC_PLANS: PublicPlan[] = [
  {
    id: 'fallback-basic',
    code: 'basic',
    name: 'Basic',
    tagline: 'Petit salon en croissance',
    price_fcfa: 5000,
    price_label: '5 000 F /mois',
    max_employees: 5,
    max_employees_label: '5 membres du personnel',
    max_services: 50,
    has_online_booking: true,
    has_analytics: false,
    features: [
      { key: 'single_salon', label: '1 salon', included: true },
      { key: 'staff', label: '5 membres du personnel', included: true },
      { key: 'agenda', label: 'Agenda + rendez-vous', included: true },
      { key: 'clients', label: 'Gestion des clients', included: true },
      { key: 'public_booking', label: 'Formulaire public de RDV', included: true },
      { key: 'live_tracking', label: 'Suivi RDV client en temps réel', included: true },
      { key: 'payments', label: 'Paiements & caisse', included: true },
      { key: 'revenue_tracking', label: 'Suivi des recettes', included: false },
      { key: 'analytics', label: 'Analytiques avancées', included: false },
      { key: 'activity_history', label: 'Historique activité complet', included: false },
    ],
  },
  {
    id: 'fallback-pro',
    code: 'pro',
    name: 'Pro',
    tagline: 'Salon structuré ou multi-équipe',
    price_fcfa: 15000,
    price_label: '15 000 F /mois',
    max_employees: null,
    max_employees_label: 'Membres du personnel illimités',
    max_services: 200,
    has_online_booking: true,
    has_analytics: true,
    features: [
      { key: 'all_basic', label: 'Tout Basic inclus', included: true },
      { key: 'staff', label: 'Membres du personnel illimités', included: true },
      { key: 'revenue_tracking', label: 'Suivi des recettes', included: true },
      { key: 'analytics', label: 'Analytiques avancées', included: true },
      { key: 'activity_history', label: 'Historique activité complet', included: true },
    ],
  },
]
