<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { AppointmentListItem, AppointmentStatus } from '@/types'
import { formatCFA, formatPhone, formatTime } from '@/lib/utils'

defineProps<{
  appointments: AppointmentListItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: AppointmentStatus]
  cancel: [id: string]
}>()

const skeletonCards = computed(() => Array.from({ length: 6 }))

const nextStatuses: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
}

const statusActionLabels: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Confirmer',
  in_progress: 'Démarrer',
  completed: 'Terminer',
  cancelled: 'Annuler',
  no_show: 'Absent',
}

function onAction(apptId: string, status: AppointmentStatus) {
  if (status === 'cancelled') {
    emit('cancel', apptId)
    return
  }
  emit('update-status', apptId, status)
}

function actionVariant(status: AppointmentStatus): 'default' | 'outline' | 'destructive' {
  if (status === 'cancelled' || status === 'no_show') return 'outline'
  if (status === 'completed') return 'default'
  return 'default'
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <template v-if="loading">
      <div
        v-for="(_, i) in skeletonCards"
        :key="i"
        class="rounded-xl border border-border bg-card p-4"
      >
        <Skeleton class="mb-3 h-5 w-16" />
        <Skeleton class="mb-2 h-5 w-3/4" />
        <Skeleton class="mb-4 h-4 w-full" />
        <div class="flex gap-2">
          <Skeleton class="h-9 flex-1" />
          <Skeleton class="h-9 flex-1" />
        </div>
      </div>
    </template>

    <p
      v-else-if="appointments.length === 0"
      class="col-span-full rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground"
    >
      Aucun rendez-vous pour cette date
    </p>

    <article
      v-for="appt in appointments"
      v-else
      :key="appt.id"
      class="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-lg font-semibold tabular-nums text-primary-800">
          {{ formatTime(appt.scheduled_at) }}
        </p>
        <StatusBadge :status="appt.status" />
      </div>

      <div class="mt-3 min-w-0 flex-1 space-y-1">
        <p class="truncate text-base font-medium text-foreground">
          {{ appt.client.name }}
        </p>
        <p class="font-mono text-xs text-muted-foreground">
          {{ formatPhone(appt.client.phone) }}
        </p>
        <p class="pt-1 text-sm text-foreground">
          {{ appt.service.name }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ appt.service.duration_min }} min · {{ formatCFA(appt.service.price) }}
          · {{ appt.staff.name }}
        </p>
      </div>

      <div
        v-if="nextStatuses[appt.status]?.length"
        class="mt-4 flex flex-wrap gap-2 border-t border-border pt-4"
      >
        <Button
          v-for="status in nextStatuses[appt.status]"
          :key="status"
          :variant="actionVariant(status!)"
          size="sm"
          class="min-h-10 flex-1 cursor-pointer text-xs sm:flex-none sm:px-4"
          :class="
            status === 'cancelled' || status === 'no_show'
              ? 'text-danger-700 hover:bg-danger-50'
              : 'bg-primary-600 text-white hover:bg-primary-800'
          "
          @click="onAction(appt.id, status!)"
        >
          {{ statusActionLabels[status!] }}
        </Button>
      </div>
    </article>
  </div>
</template>
