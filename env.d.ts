/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Domaines autorisés pour la redirection de paiement, séparés par des virgules. */
  readonly VITE_PAYMENT_HOSTS?: string
}
