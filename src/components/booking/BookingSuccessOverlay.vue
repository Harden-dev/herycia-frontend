<script setup lang="ts">
import { onMounted } from 'vue'
import { IconCalendar, IconClock, IconScissors, IconUser } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { fireBookingConfetti } from '@/lib/confetti'
import { formatCFA } from '@/lib/utils'

export interface BookingSuccessRecap {
  salonName: string
  clientName: string
  serviceName: string
  employeeName: string
  dateLabel: string
  timeLabel: string
  price?: number
  durationMin?: number
}

defineProps<{
  recap: BookingSuccessRecap
}>()

const emit = defineEmits<{
  continue: []
}>()

onMounted(() => {
  fireBookingConfetti()
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    role="dialog"
    aria-labelledby="booking-success-title"
  >
    <div class="booking-success-panel w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <div class="flex flex-col items-center text-center">
        <svg class="h-20 w-20" viewBox="0 0 52 52" aria-hidden="true">
          <circle
            class="booking-check-circle fill-none stroke-primary-500"
            cx="26"
            cy="26"
            r="24"
            stroke-width="2"
          />
          <path
            class="booking-check-mark fill-none stroke-primary-600"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14 27l7 7 16-16"
          />
        </svg>

        <h2 id="booking-success-title" class="mt-4 text-xl font-semibold text-foreground">
          C'est confirmé !
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Votre rendez-vous chez {{ recap.salonName }} est enregistré.
        </p>
      </div>

      <div class="mt-6 space-y-3 rounded-xl border border-primary-200 bg-primary-50/60 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            <IconScissors :size="18" />
          </div>
          <div class="min-w-0 text-left">
            <p class="text-xs text-muted-foreground">Service</p>
            <p class="truncate text-sm font-medium text-foreground">{{ recap.serviceName }}</p>
            <p
              v-if="recap.durationMin || recap.price"
              class="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <IconClock v-if="recap.durationMin" :size="12" />
              <span v-if="recap.durationMin">{{ recap.durationMin }} min</span>
              <span v-if="recap.durationMin && recap.price">·</span>
              <span v-if="recap.price" class="font-medium text-primary-800">
                {{ formatCFA(recap.price) }}
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            <IconUser :size="18" />
          </div>
          <div class="text-left">
            <p class="text-xs text-muted-foreground">Coiffeur</p>
            <p class="text-sm font-medium text-foreground">{{ recap.employeeName }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            <IconCalendar :size="18" />
          </div>
          <div class="text-left">
            <p class="text-xs text-muted-foreground">Date & heure</p>
            <p class="text-sm font-medium text-foreground">
              {{ recap.dateLabel }} à {{ recap.timeLabel }}
            </p>
          </div>
        </div>
      </div>

      <Button
        class="mt-6 w-full bg-primary-600 hover:bg-primary-800"
        @click="emit('continue')"
      >
        Suivre mon rendez-vous
      </Button>
    </div>
  </div>
</template>
