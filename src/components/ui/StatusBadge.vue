<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const config: Record<string, { label: string; class: string }> = {
  active: { label: 'Actif', class: 'bg-success-50 text-success-800' },
  trial: { label: 'Trial', class: 'bg-warning-50 text-warning-800' },
  expired: { label: 'Expiré', class: 'bg-danger-50 text-danger-800' },
  cancelled: { label: 'Annulé', class: 'bg-secondary text-muted-foreground' },

  pending: { label: 'En attente', class: 'bg-warning-50 text-warning-800' },
  confirmed: { label: 'Confirmé', class: 'bg-success-50 text-success-800' },
  in_progress: { label: 'En cours', class: 'bg-accent-50 text-accent-800' },
  done: { label: 'Terminé', class: 'bg-secondary text-muted-foreground' },
  completed: { label: 'Terminé', class: 'bg-secondary text-muted-foreground' },
  no_show: { label: 'No show', class: 'bg-danger-50 text-danger-800' },

  waiting: { label: 'En attente', class: 'bg-warning-50 text-warning-800' },
  called: { label: 'Appelé', class: 'bg-accent-50 text-accent-800' },

  paid: { label: 'Payé', class: 'bg-success-50 text-success-800' },
  failed: { label: 'Échec', class: 'bg-danger-50 text-danger-800' },
  refunded: { label: 'Remboursé', class: 'bg-secondary text-muted-foreground' },
}

const current = computed(
  () =>
    config[props.status] ?? {
      label: props.status,
      class: 'bg-secondary text-muted-foreground',
    },
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
    :class="current.class"
  >
    {{ current.label }}
  </span>
</template>
