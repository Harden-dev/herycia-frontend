<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  IconCalendarRepeat,
  IconClock,
  IconLoader2,
  IconRefresh,
  IconUserCheck,
  IconUserPlus,
  IconUsersGroup,
} from '@tabler/icons-vue'
import WalkInForm from '@/components/queue/WalkInForm.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { formatDate, formatTime } from '@/lib/utils'
import { fetchServices } from '@/services/prestations.service'
import {
  applyQueueAction,
  fetchQueueBoard,
  fetchStaffWalkInOptions,
  reassignQueueEntry,
  staffCheckIn,
  staffLateChoice,
  staffWalkIn,
} from '@/services/queue.service'
import type {
  CheckInResult,
  LateChoice,
  QueueAction,
  QueueBoard,
  QueueBoardRow,
  QueueExpectedAppointment,
  WalkInOptions,
  WalkInPayload,
  WalkInService,
} from '@/types/queue'

/** Rafraîchissement automatique du tableau. */
const POLL_INTERVAL_MS = 30_000

const board = ref<QueueBoard | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref<string | null>(null)
const busy = ref<string | null>(null)
let timer: number | undefined

type LateResult = Extract<CheckInResult, { status: 'late' }>
const lateDialog = ref<{ appointmentId: string; result: LateResult } | null>(null)
const lateDialogOpen = computed({
  get: () => lateDialog.value !== null,
  set: (open: boolean) => {
    if (!open) lateDialog.value = null
  },
})

const STATUS_LABELS: Record<QueueBoardRow['status'], string> = {
  waiting: 'En attente',
  called: 'Appelé',
  in_service: 'En cours',
  done: 'Terminé',
  cancelled: 'Retiré',
}

const STATUS_CLASSES: Record<QueueBoardRow['status'], string> = {
  waiting: 'bg-secondary text-foreground',
  called: 'bg-warning-50 text-warning-800',
  in_service: 'bg-primary-50 text-primary-800',
  done: 'bg-secondary text-muted-foreground',
  cancelled: 'bg-secondary text-muted-foreground',
}

/** Actions proposées selon l'état du client. */
function actionsFor(
  row: QueueBoardRow,
): { action: QueueAction; label: string; primary?: boolean }[] {
  switch (row.status) {
    case 'waiting':
      return [
        { action: 'call', label: 'Appeler', primary: true },
        { action: 'start', label: 'Démarrer' },
        { action: 'no-show', label: 'Absent' },
      ]
    case 'called':
      return [
        { action: 'start', label: 'Démarrer', primary: true },
        { action: 'no-show', label: 'Absent' },
      ]
    case 'in_service':
      return [{ action: 'done', label: 'Terminer', primary: true }]
    default:
      return []
  }
}

async function load(manual = false) {
  if (manual) refreshing.value = true
  error.value = null
  try {
    const response = await fetchQueueBoard()
    board.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function runAction(row: QueueBoardRow, action: QueueAction) {
  busy.value = `${row.id}:${action}`
  try {
    await applyQueueAction(row.id, action)
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    busy.value = null
  }
}

async function handleCheckInResult(appointmentId: string, result: CheckInResult) {
  if (result.status === 'late') {
    lateDialog.value = { appointmentId, result }
    return
  }
  lateDialog.value = null
  toast.success(
    result.status === 'queued'
      ? `${result.entry.client.name ?? 'Client'} ajouté à la file`
      : `Rendez-vous reprogrammé au ${formatDate(result.appointment.scheduled_at ?? '')} à ${formatTime(result.appointment.scheduled_at ?? '')}`,
  )
  await load()
}

async function checkIn(appointment: QueueExpectedAppointment) {
  busy.value = `checkin:${appointment.id}`
  try {
    const response = await staffCheckIn(appointment.id)
    await handleCheckInResult(appointment.id, response.data)
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    busy.value = null
  }
}

async function chooseLate(choice: LateChoice) {
  if (!lateDialog.value) return
  const { appointmentId } = lateDialog.value
  busy.value = `late:${choice}`
  try {
    const response = await staffLateChoice(appointmentId, choice)
    await handleCheckInResult(appointmentId, response.data)
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    busy.value = null
  }
}

/* ---------- V2 : sans rendez-vous et réaffectation ---------- */

const walkInOpen = ref(false)
const walkInServices = ref<WalkInService[]>([])
const walkInSubmitting = ref(false)

async function openWalkIn() {
  walkInOpen.value = true
  try {
    const response = await fetchServices({ is_active: true, per_page: 100 })
    walkInServices.value = response.data.map((s) => ({
      id: s.id,
      name: s.name,
      duration_min: s.duration_min,
      price: s.price,
    }))
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  }
}

async function fetchWalkInOptions(serviceId: string): Promise<WalkInOptions> {
  return (await fetchStaffWalkInOptions(serviceId)).data
}

async function submitWalkIn(payload: WalkInPayload) {
  walkInSubmitting.value = true
  try {
    const result = (await staffWalkIn(payload)).data
    if (result.status === 'queued') {
      toast.success(
        `${result.entry.client.name ?? 'Client'} ajouté chez ${result.entry.stylist.name}`,
      )
    }
    walkInOpen.value = false
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    walkInSubmitting.value = false
  }
}

async function reassign(row: QueueBoardRow, event: Event) {
  const select = event.target as HTMLSelectElement
  const stylistId = select.value
  select.value = ''
  if (!stylistId) return
  busy.value = `${row.id}:reassign`
  try {
    await reassignQueueEntry(row.id, stylistId)
    toast.success(`${row.client.name ?? 'Client'} confié à un autre coiffeur`)
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    busy.value = null
  }
}

onMounted(() => {
  void load()
  timer = window.setInterval(() => void load(), POLL_INTERVAL_MS)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div>
    <AppHeader
      title="File d'attente"
      description="Arrivées du jour et ordre de passage par coiffeur"
    >
      <template #actions>
        <Button
          size="sm"
          class="cursor-pointer gap-2"
          data-testid="walkin-open"
          @click="openWalkIn"
        >
          <IconUserPlus :size="16" />
          Client sans RDV
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="cursor-pointer gap-2"
          :disabled="loading || refreshing"
          @click="load(true)"
        >
          <IconRefresh :size="16" :class="refreshing && 'animate-spin'" />
          Actualiser
        </Button>
      </template>
    </AppHeader>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-64 rounded-xl" />
      <Skeleton class="h-64 rounded-xl" />
    </div>

    <p
      v-else-if="error"
      class="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
    >
      {{ error }}
    </p>

    <p
      v-else-if="board && board.stylists.length === 0"
      class="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
    >
      Aucun coiffeur actif. Ajoutez des coiffeurs dans Équipe pour utiliser la file d'attente.
    </p>

    <div v-else-if="board" class="grid gap-4 lg:grid-cols-2">
      <section
        v-for="stylist in board.stylists"
        :key="stylist.id"
        class="rounded-xl border border-border bg-card"
        :data-testid="`queue-stylist-${stylist.id}`"
      >
        <header class="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 class="font-medium text-foreground">{{ stylist.name }}</h2>
          <span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <IconUsersGroup :size="14" />
            {{ stylist.queue.filter((r) => r.status !== 'in_service').length }} en attente
          </span>
        </header>

        <!-- File -->
        <ul class="divide-y divide-border">
          <li
            v-if="stylist.queue.length === 0"
            class="px-4 py-6 text-center text-sm text-muted-foreground"
          >
            Personne dans la file.
          </li>
          <li
            v-for="row in stylist.queue"
            :key="row.id"
            class="flex flex-wrap items-center gap-3 px-4 py-3"
            data-testid="queue-row"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground"
            >
              {{ row.status === 'in_service' ? '▶' : row.position }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">
                {{ row.client.name }}
                <span
                  v-if="row.source === 'late'"
                  class="ml-1 rounded bg-warning-50 px-1.5 py-0.5 text-[11px] font-normal text-warning-800"
                >
                  retard
                </span>
                <span
                  v-else-if="row.source === 'walk_in'"
                  class="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground"
                >
                  sans RDV
                </span>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ row.service.name }}
                <template v-if="row.appointment?.scheduled_at">
                  · RDV {{ formatTime(row.appointment.scheduled_at) }}
                </template>
                <template v-if="row.status !== 'in_service' && row.estimated_start_at">
                  · passage ~{{ formatTime(row.estimated_start_at) }}
                </template>
              </p>
            </div>
            <span class="rounded-full px-2 py-0.5 text-xs" :class="STATUS_CLASSES[row.status]">
              {{ STATUS_LABELS[row.status] }}
            </span>
            <div class="flex w-full flex-wrap items-center justify-end gap-2">
              <select
                v-if="
                  (row.status === 'waiting' || row.status === 'called') && board.stylists.length > 1
                "
                class="h-8 rounded-md border border-input bg-card px-2 text-xs text-muted-foreground"
                aria-label="Changer de coiffeur"
                :disabled="busy !== null"
                @change="reassign(row, $event)"
              >
                <option value="">Changer de coiffeur…</option>
                <option
                  v-for="other in board.stylists.filter((s) => s.id !== stylist.id)"
                  :key="other.id"
                  :value="other.id"
                >
                  {{ other.name }}
                </option>
              </select>
              <Button
                v-for="item in actionsFor(row)"
                :key="item.action"
                size="sm"
                :variant="item.primary ? 'default' : 'outline'"
                class="cursor-pointer"
                :disabled="busy !== null"
                @click="runAction(row, item.action)"
              >
                <IconLoader2
                  v-if="busy === `${row.id}:${item.action}`"
                  :size="14"
                  class="mr-1 animate-spin"
                />
                {{ item.label }}
              </Button>
            </div>
          </li>
        </ul>

        <!-- Attendus -->
        <div
          v-if="stylist.expected.length"
          class="border-t border-border bg-secondary/40 px-4 py-3"
        >
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Attendus aujourd'hui
          </p>
          <ul class="space-y-2">
            <li
              v-for="appointment in stylist.expected"
              :key="appointment.id"
              class="flex items-center gap-3"
              data-testid="queue-expected"
            >
              <span class="inline-flex w-14 items-center gap-1 text-xs text-muted-foreground">
                <IconClock :size="12" />
                {{ formatTime(appointment.scheduled_at ?? '') }}
              </span>
              <span class="min-w-0 flex-1 truncate text-sm text-foreground">
                {{ appointment.client.name }}
                <span v-if="appointment.status === 'no_show'" class="ml-1 text-xs text-danger-800"
                  >absent</span
                >
                <span v-else-if="appointment.is_late" class="ml-1 text-xs text-warning-800"
                  >en retard</span
                >
              </span>
              <Button
                size="sm"
                variant="outline"
                class="cursor-pointer gap-1"
                :disabled="busy !== null"
                @click="checkIn(appointment)"
              >
                <IconLoader2
                  v-if="busy === `checkin:${appointment.id}`"
                  :size="14"
                  class="animate-spin"
                />
                <IconUserCheck v-else :size="14" />
                Arrivé
              </Button>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Client sans rendez-vous saisi à l'accueil -->
    <Dialog v-model:open="walkInOpen">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Client sans rendez-vous</DialogTitle>
          <DialogDescription>
            Il sera placé après le dernier de la liste du coiffeur choisi.
          </DialogDescription>
        </DialogHeader>
        <WalkInForm
          v-if="walkInOpen"
          :services="walkInServices"
          :fetch-options="fetchWalkInOptions"
          :submitting="walkInSubmitting"
          submit-label="Ajouter à la file"
          @submit="submitWalkIn"
        />
      </DialogContent>
    </Dialog>

    <!-- Choix du client en retard (saisi par l'accueil) -->
    <Dialog v-model:open="lateDialogOpen">
      <DialogContent v-if="lateDialog" class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Client en retard</DialogTitle>
          <DialogDescription>
            {{ lateDialog.result.appointment.client.name }} avait rendez-vous à
            {{ formatTime(lateDialog.result.appointment.scheduled_at ?? '') }} (tolérance
            {{ lateDialog.result.late_tolerance_minutes }} min). Demandez-lui ce qu'il préfère :
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3">
          <Button
            variant="outline"
            class="h-auto w-full cursor-pointer flex-col items-start gap-1 whitespace-normal p-4 text-left"
            :disabled="!lateDialog.result.options.queue || busy !== null"
            @click="chooseLate('queue')"
          >
            <span class="inline-flex items-center gap-2 font-medium">
              <IconUsersGroup :size="16" /> Passer après le dernier
            </span>
            <span
              v-if="lateDialog.result.options.queue"
              class="text-xs font-normal text-muted-foreground"
            >
              Position {{ lateDialog.result.options.queue.position }}, passage ~{{
                formatTime(lateDialog.result.options.queue.estimated_start_at)
              }}
            </span>
            <span v-else class="text-xs font-normal text-muted-foreground">
              Plus de place avant la fermeture.
            </span>
          </Button>

          <Button
            variant="outline"
            class="h-auto w-full cursor-pointer flex-col items-start gap-1 whitespace-normal p-4 text-left"
            :disabled="!lateDialog.result.options.reschedule || busy !== null"
            @click="chooseLate('reschedule')"
          >
            <span class="inline-flex items-center gap-2 font-medium">
              <IconCalendarRepeat :size="16" /> Même heure, un autre jour
            </span>
            <span
              v-if="lateDialog.result.options.reschedule"
              class="text-xs font-normal text-muted-foreground"
            >
              {{ formatDate(lateDialog.result.options.reschedule.scheduled_at) }} à
              {{ formatTime(lateDialog.result.options.reschedule.scheduled_at) }}
            </span>
            <span v-else class="text-xs font-normal text-muted-foreground">
              Aucune disponibilité dans les 30 prochains jours.
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
