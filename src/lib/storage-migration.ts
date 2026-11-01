/**
 * Renommage du produit (Herycia → MANYAN) : les clés du navigateur changent de préfixe.
 * On recopie les anciennes valeurs une seule fois pour que personne ne soit déconnecté
 * ni ne perde ses rendez-vous mémorisés.
 */
const RENAMED_KEYS: Array<[string, string]> = [
  ['herycia_token', 'manyan_token'],
  ['herycia_user', 'manyan_user'],
  ['herycia_selected_plan_code', 'manyan_selected_plan_code'],
  ['herycia_bookings', 'manyan_bookings'],
]

export function migrateLegacyStorageKeys(storage: Storage = window.localStorage) {
  try {
    for (const [legacy, current] of RENAMED_KEYS) {
      const value = storage.getItem(legacy)
      if (value === null) continue
      if (storage.getItem(current) === null) storage.setItem(current, value)
      storage.removeItem(legacy)
    }
  } catch {
    // Stockage indisponible (navigation privée, quotas) : rien à migrer.
  }
}
