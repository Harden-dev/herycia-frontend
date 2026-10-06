<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IconBellRinging, IconCheck, IconClock, IconRefresh, IconScissors } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { formatTime } from '@/lib/utils'
import { fetchQueuePosition } from '@/services/queue.service'
import type { PublicQueueEntry } from '@/types/queue'
import '@/assets/booking.css'

/** Rafraîchissement automatique de la position. */
const POLL_INTERVAL_MS = 20_000

const route = useRoute()
const token = route.params.token as string

const entry = ref<PublicQueueEntry | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref<string | null>(null)
let timer: number | undefined

const isFinished = computed(
  () => entry.value?.status === 'done' || entry.value?.status === 'cancelled',
)

const headline = computed(() => {
  const e = entry.value
  if (!e) return ''
  switch (e.status) {
    case 'in_service':
      return 'C’est à vous, installez-vous !'
    case 'called':
      return 'Vous êtes appelé, présentez-vous'
    case 'done':
      return 'Prestation terminée, merci !'
    case 'cancelled':
      return 'Vous n’êtes plus dans la file'
    default:
      if (e.people_ahead === 0) return 'Vous êtes le prochain'
      return `${e.people_ahead} personne${(e.people_ahead ?? 0) > 1 ? 's' : ''} avant vous`
  }
})

async function load(manual = false) {
  if (manual) refreshing.value = true
  error.value = null
  try {
    const response = await fetchQueuePosition(token)
    entry.value = response.data
    if (isFinished.value) stopPolling()
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function stopPolling() {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

onMounted(() => {
  void load()
  timer = window.setInterval(() => void load(), POLL_INTERVAL_MS)
})
onBeforeUnmount(stopPolling)
</script>

<template>
  <div class="min-h-screen bg-secondary">
    <header class="relative overflow-hidden bg-primary-900 px-4 pb-16 pt-6 md:px-6">
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-800/40"
        aria-hidden="true"
      />
      <div class="relative mx-auto flex max-w-lg items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-800 shadow-md"
          >
            <IconScissors :size="20" class="text-primary-100" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-primary-100/70">
              File d’attente
            </p>
            <p class="text-sm font-medium text-white">{{ entry?.salon.name ?? 'Salon' }}</p>
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
          <IconRefresh :size="18" :class="refreshing && 'animate-spin'" />
        </Button>
      </div>
    </header>

    <main class="relative mx-auto max-w-lg px-4 pb-10 md:px-6">
      <Skeleton v-if="loading" class="-mt-10 h-56 w-full rounded-2xl" />

      <p
        v-else-if="error && !entry"
        class="-mt-8 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
      >
        {{ error }}
      </p>

      <div
        v-else-if="entry"
        class="booking-fade-up -mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_40px_rgb(96_68_5_/_0.12)]"
      >
        <div class="px-5 py-6 text-center">
          <div
            v-if="entry.status === 'waiting' && entry.position !== null"
            class="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-primary-50"
          >
            <span class="text-4xl font-bold text-primary-700" data-testid="queue-position">{{
              entry.position
            }}</span>
            <span class="text-xs text-muted-foreground">position</span>
          </div>
          <IconBellRinging
            v-else-if="entry.status === 'called' || entry.status === 'in_service'"
            :size="48"
            class="mx-auto text-primary-600"
          />
          <IconCheck v-else :size="48" class="mx-auto text-primary-600" />

          <h1 class="mt-4 text-lg font-semibold text-foreground" data-testid="queue-headline">
            {{ headline }}
          </h1>

          <p
            v-if="entry.status === 'waiting' && entry.estimated_start_at"
            class="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <IconClock :size="16" />
            Passage estimé vers
            <strong class="text-foreground">{{ formatTime(entry.estimated_start_at) }}</strong>
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-4 border-t border-border px-5 py-4 text-sm">
          <div>
            <dt class="text-xs text-muted-foreground">Prestation</dt>
            <dd class="font-medium text-foreground">{{ entry.service.name }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">Coiffeur</dt>
            <dd class="font-medium text-foreground">{{ entry.stylist.name }}</dd>
          </div>
        </dl>

        <p
          v-if="!isFinished"
          class="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground"
        >
          Mise à jour automatique. Gardez cette page ouverte.
        </p>
      </div>
    </main>
  </div>
</template>
