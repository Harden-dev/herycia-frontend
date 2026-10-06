<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IconCalendarRepeat,
  IconClockExclamation,
  IconLoader2,
  IconPhone,
  IconScissors,
  IconUsersGroup,
} from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api'
import { findTodayBooking } from '@/lib/booking-memory'
import { formatDate, formatTime } from '@/lib/utils'
import { publicCheckIn, publicLateChoice } from '@/services/queue.service'
import type { CheckInResult, LateChoice } from '@/types/queue'
import '@/assets/booking.css'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const key = (route.query.k as string | undefined) ?? ''

const remembered = findTodayBooking(slug)
const phone = ref('')
const loading = ref(false)
const choosing = ref<LateChoice | null>(null)
const error = ref<string | null>(null)

type LateResult = Extract<CheckInResult, { status: 'late' }>
type RescheduledResult = Extract<CheckInResult, { status: 'rescheduled' }>

const late = ref<LateResult | null>(null)
const rescheduled = ref<RescheduledResult | null>(null)

const missingKey = computed(() => key === '')

async function handleResult(result: CheckInResult) {
  if (result.status === 'queued') {
    await router.replace({ name: 'queue-track', params: { token: result.entry.tracking_token } })
    return
  }
  if (result.status === 'late') {
    late.value = result
    return
  }
  rescheduled.value = result
  late.value = null
}

async function checkIn(byToken: boolean) {
  error.value = null
  loading.value = true
  try {
    const response = await publicCheckIn(
      slug,
      byToken && remembered
        ? { key, tracking_token: remembered.tracking_token }
        : { key, phone: phone.value.trim() },
    )
    await handleResult(response.data)
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function choose(choice: LateChoice) {
  const token = late.value?.appointment.tracking_token
  if (!token) return
  error.value = null
  choosing.value = choice
  try {
    const response = await publicLateChoice(slug, { key, tracking_token: token, choice })
    await handleResult(response.data)
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    choosing.value = null
  }
}

function dayAndTime(iso: string | null | undefined): string {
  if (!iso) return ''
  return `${formatDate(iso)} à ${formatTime(iso)}`
}
</script>

<template>
  <div class="min-h-screen bg-secondary">
    <header class="relative overflow-hidden bg-primary-900 px-4 pb-16 pt-6 md:px-6">
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-800/40"
        aria-hidden="true"
      />
      <div class="relative mx-auto flex max-w-lg items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-800 shadow-md">
          <IconScissors :size="20" class="text-primary-100" />
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-primary-100/70">
            Arrivée au salon
          </p>
          <p class="text-sm font-medium text-white">Je suis arrivé</p>
        </div>
      </div>
    </header>

    <main class="relative mx-auto max-w-lg px-4 pb-10 md:px-6">
      <div
        class="booking-fade-up -mt-10 rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_rgb(96_68_5_/_0.12)]"
      >
        <p
          v-if="error"
          class="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- QR incomplet -->
        <p v-if="missingKey" class="text-sm text-muted-foreground">
          Ce lien est incomplet. Scannez le QR code affiché à l’accueil du salon pour signaler votre
          arrivée.
        </p>

        <!-- Reprogrammé -->
        <div v-else-if="rescheduled" class="space-y-3 text-center">
          <IconCalendarRepeat :size="36" class="mx-auto text-primary-600" />
          <h1 class="text-lg font-semibold text-foreground">Rendez-vous reprogrammé</h1>
          <p class="text-sm text-muted-foreground">
            {{ rescheduled.appointment.service.name }} avec
            {{ rescheduled.appointment.stylist.name }}
          </p>
          <p class="text-base font-semibold text-foreground">
            {{ dayAndTime(rescheduled.appointment.scheduled_at) }}
          </p>
          <a
            v-if="rescheduled.appointment.tracking_token"
            :href="`/rdv/${rescheduled.appointment.tracking_token}`"
            class="inline-block text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            Voir mon rendez-vous
          </a>
        </div>

        <!-- En retard : choix du client -->
        <div v-else-if="late" class="space-y-4">
          <div class="flex items-start gap-3">
            <IconClockExclamation :size="24" class="mt-0.5 shrink-0 text-warning-600" />
            <div>
              <h1 class="text-lg font-semibold text-foreground">Vous êtes en retard</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Votre rendez-vous était à
                {{ formatTime(late.appointment.scheduled_at ?? '') }} (tolérance
                {{ late.late_tolerance_minutes }} min). Choisissez ce qui vous arrange :
              </p>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-xl border border-border p-4 text-left transition-colors hover:border-primary-400 hover:bg-primary-50/50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!late.options.queue || choosing !== null"
            @click="choose('queue')"
          >
            <div class="flex items-center gap-2 font-medium text-foreground">
              <IconUsersGroup :size="18" class="text-primary-600" />
              Passer après le dernier de la liste
            </div>
            <p v-if="late.options.queue" class="mt-1 text-sm text-muted-foreground">
              Vous serez {{ late.options.queue.position }}<sup>e</sup> — passage estimé vers
              <strong>{{ formatTime(late.options.queue.estimated_start_at) }}</strong>
            </p>
            <p v-else class="mt-1 text-sm text-muted-foreground">
              Plus de place aujourd’hui avant la fermeture.
            </p>
            <IconLoader2 v-if="choosing === 'queue'" :size="16" class="mt-2 animate-spin" />
          </button>

          <button
            type="button"
            class="w-full rounded-xl border border-border p-4 text-left transition-colors hover:border-primary-400 hover:bg-primary-50/50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!late.options.reschedule || choosing !== null"
            @click="choose('reschedule')"
          >
            <div class="flex items-center gap-2 font-medium text-foreground">
              <IconCalendarRepeat :size="18" class="text-primary-600" />
              Revenir un autre jour, à la même heure
            </div>
            <p v-if="late.options.reschedule" class="mt-1 text-sm text-muted-foreground">
              Prochaine disponibilité :
              <strong>{{ dayAndTime(late.options.reschedule.scheduled_at) }}</strong>
            </p>
            <p v-else class="mt-1 text-sm text-muted-foreground">
              Aucune disponibilité à cette heure dans les 30 prochains jours.
            </p>
            <IconLoader2 v-if="choosing === 'reschedule'" :size="16" class="mt-2 animate-spin" />
          </button>
        </div>

        <!-- Enregistrement -->
        <div v-else class="space-y-4">
          <div>
            <h1 class="text-lg font-semibold text-foreground">Signalez votre arrivée</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              Vous rejoindrez la file de votre coiffeur et verrez votre position.
            </p>
          </div>

          <div
            v-if="remembered"
            class="space-y-3 rounded-xl border border-primary-200 bg-primary-50/50 p-4"
          >
            <p class="text-sm text-foreground">
              Rendez-vous trouvé sur ce téléphone, aujourd’hui à
              <strong>{{ formatTime(remembered.scheduled_at) }}</strong
              >.
            </p>
            <Button class="w-full cursor-pointer" :disabled="loading" @click="checkIn(true)">
              <IconLoader2 v-if="loading" :size="16" class="mr-2 animate-spin" />
              C’est moi, je suis arrivé
            </Button>
          </div>

          <form class="space-y-3" @submit.prevent="checkIn(false)">
            <Label for="checkin-phone" class="text-sm font-medium">
              {{ remembered ? 'Ou avec votre numéro' : 'Votre numéro de téléphone' }}
            </Label>
            <div class="relative">
              <IconPhone
                :size="16"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="checkin-phone"
                v-model="phone"
                type="tel"
                placeholder="07 08 11 22 33"
                class="pl-9"
                required
                :disabled="loading"
              />
            </div>
            <Button
              type="submit"
              :variant="remembered ? 'outline' : 'default'"
              class="w-full cursor-pointer"
              :disabled="loading || phone.trim().length < 8"
            >
              Je suis arrivé
            </Button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
