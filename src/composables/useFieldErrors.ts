import { computed, ref, watch } from 'vue'

/**
 * Erreurs par champ d'un formulaire : validation locale + erreurs 422 reçues du parent (prop).
 * Une erreur disparaît dès que l'utilisateur modifie le champ, sans muter la prop.
 */
export function useFieldErrors(serverErrors: () => Record<string, string> | null | undefined) {
  const clientErrors = ref<Record<string, string>>({})
  const clearedServerFields = ref<string[]>([])

  watch(serverErrors, () => {
    clearedServerFields.value = []
  })

  const errors = computed<Record<string, string>>(() => {
    const server = Object.entries(serverErrors() ?? {}).filter(
      ([field]) => !clearedServerFields.value.includes(field),
    )
    return { ...Object.fromEntries(server), ...clientErrors.value }
  })

  function clearFieldError(field: string) {
    if (!clearedServerFields.value.includes(field)) {
      clearedServerFields.value = [...clearedServerFields.value, field]
    }
    if (field in clientErrors.value) {
      const next = { ...clientErrors.value }
      delete next[field]
      clientErrors.value = next
    }
  }

  return { clientErrors, errors, clearFieldError }
}
