<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconPhone,
  IconRefresh,
  IconScissors,
  IconUser,
} from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { getApiErrorMessage } from '@/lib/api'
import PublicSalonBrand from '@/components/booking/PublicSalonBrand.vue'
import { fetchBookingByToken } from '@/services/booking.service'
import type { PublicBookingTracking } from '@/types/booking'
import type { AppointmentStatus } from '@/types'
import { formatCFA, formatDate, formatDateTimeShort, formatPhone, initials } from '@/lib/utils'
import '@/assets/booking.css'

const route = useRoute()
const token = route.params.token as string

const booking = ref<PublicBookingTracking | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref<string | null>(null)

const statusSteps: { key: AppointmentStatus; label: string }[] = [
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmé' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminé' },
]

const statusOrder: AppointmentStatus[] = ['pending', 'confirmed', 'in_progress', 'completed']

const currentStepIndex = computed(() => {
  if (!booking.value) return 0
  const idx = statusOrder.indexOf(booking.value.status as AppointmentStatus)
  return idx >= 0 ? idx : 0
})

const progressPercent = computed(() => {
  if (statusSteps.length <= 1) return 0
  return (currentStepIndex.value / (statusSteps.length - 1)) * 100
})

async function load(showRefresh = false) {
  if (showRefresh) refreshing.value = true
  else loading.value = true
  error.value = null
  try {
    const response = await fetchBookingByToken(token)
    if (!response.success) throw new Error(response.message)
    booking.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
    if (!showRefresh) booking.value = null
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <div class="min-h-screen bg-secondary">
    <!-- Header -->
    <header
      class="relative overflow-hidden border-b border-primary-800/20 bg-primary-900 px-4 pb-16 pt-6 md:px-6"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-800/40"
        aria-hidden="true"
      />
      <div class="relative mx-auto flex max-w-lg items-center justify-between">
        <PublicSalonBrand
          v-if="booking"
          :name="booking.salon.name"
          :logo-url="booking.salon.logo_url"
          subtitle="Suivi en temps réel"
          variant="dark"
          size="sm"
        />
        <div v-else class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-800 shadow-md"
          >
            <IconScissors :size="20" class="text-primary-100" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-primary-100/70">
              Suivi en temps réel
            </p>
            <p class="text-sm font-medium text-white">Salon</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="text-primary-100 hover:bg-primary-800/60 hover:text-white"
          :disabled="loading || refreshing"
          aria-label="Actualiser"
          @click="load(true)"
        >
          <IconRefresh :size="18" class="text-primary-100" :class="refreshing && 'animate-spin'" />
        </Button>
      </div>
    </header>

    <main class="relative mx-auto max-w-lg px-4 pb-10 md:px-6">
      <template v-if="loading">
        <div class="-mt-10 space-y-4">
          <Skeleton class="h-40 w-full rounded-2xl" />
          <Skeleton class="h-56 w-full rounded-2xl" />
        </div>
      </template>

      <p
        v-else-if="error"
        class="-mt-8 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
      >
        {{ error }}
      </p>

      <template v-else-if="booking">
        <!-- Carte statut -->
        <div
          class="booking-fade-up -mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_40px_rgb(96_68_5_/_0.12)]"
        >
          <div class="border-b border-border bg-primary-50/50 px-5 py-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h1 class="truncate text-lg font-medium text-foreground">
                  {{ booking.salon.name }}
                </h1>
                <p
                  v-if="booking.salon.city"
                  class="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <IconMapPin :size="14" class="shrink-0" />
                  {{ booking.salon.city }}
                </p>
              </div>
              <StatusBadge :status="booking.status" />
            </div>
            <p class="mt-3 font-mono text-[11px] text-muted-foreground">
              Réf. {{ booking.tracking_token }}
            </p>
          </div>

          <!-- Timeline statut -->
          <div class="px-5 py-5">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Progression
            </p>
            <div class="relative">
              <div
                class="absolute left-[10%] right-[10%] top-4 h-0.5 overflow-hidden rounded-full bg-border"
                aria-hidden="true"
              >
                <div
                  class="booking-progress-line h-full rounded-full bg-primary-400"
                  :style="{ transform: `scaleX(${progressPercent / 100})` }"
                />
              </div>
              <div class="relative flex items-start justify-between gap-1">
                <div
                  v-for="(step, index) in statusSteps"
                  :key="step.key"
                  class="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium transition-all duration-300"
                    :class="[
                      index <= currentStepIndex
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'border border-border bg-secondary text-muted-foreground',
                      index === currentStepIndex && 'booking-step-active',
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <span
                    class="text-center text-[10px] leading-tight transition-colors duration-300"
                    :class="
                      index <= currentStepIndex
                        ? 'font-medium text-primary-800'
                        : 'text-muted-foreground'
                    "
                  >
                    {{ step.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails RDV -->
        <div
          class="booking-fade-up booking-fade-up-delay-1 mt-4 overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div class="flex items-center gap-3 border-b border-border px-5 py-4">
            <Avatar class="h-11 w-11">
              <AvatarFallback class="bg-primary-50 text-sm font-medium text-primary-800">
                {{ initials(booking.client.name) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-xs text-muted-foreground">Client</p>
              <p class="font-medium text-foreground">{{ booking.client.name }}</p>
            </div>
          </div>

          <div class="divide-y divide-border">
            <div class="flex items-start gap-3 px-5 py-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700"
              >
                <IconCalendar :size="18" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Date & heure</p>
                <p class="text-sm font-medium text-foreground">
                  {{ formatDate(booking.scheduled_at) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDateTimeShort(booking.scheduled_at).split(' - ')[1] }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 px-5 py-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700"
              >
                <IconScissors :size="18" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Service</p>
                <p class="text-sm font-medium text-foreground">{{ booking.service.name }}</p>
                <p class="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <IconClock :size="12" />
                  {{ booking.service.duration_min }} min
                  <span class="text-foreground">·</span>
                  <span class="font-medium text-primary-800">
                    {{ formatCFA(booking.service.price) }}
                  </span>
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 px-5 py-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-800"
              >
                <IconUser :size="18" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Coiffeur</p>
                <p class="text-sm font-medium text-foreground">{{ booking.employee.name }}</p>
              </div>
            </div>
          </div>

          <div
            v-if="booking.salon.address || booking.salon.phone"
            class="border-t border-border bg-secondary/40 px-5 py-4"
          >
            <p
              v-if="booking.salon.address"
              class="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <IconMapPin :size="16" class="mt-0.5 shrink-0" />
              {{ booking.salon.address }}
            </p>
            <p
              v-if="booking.salon.phone"
              class="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <IconPhone :size="16" class="shrink-0" />
              {{ formatPhone(booking.salon.phone) }}
            </p>
          </div>

          <div v-if="booking.notes" class="border-t border-border px-5 py-4">
            <p class="text-xs text-muted-foreground">Notes</p>
            <p class="mt-1 text-sm text-foreground">{{ booking.notes }}</p>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          Conservez ce lien pour suivre l'évolution de votre rendez-vous.
        </p>
      </template>
    </main>
  </div>
</template>
