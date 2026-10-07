<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconDownload, IconRefresh } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { fetchCheckinQr, regenerateCheckinQr } from '@/services/queue.service'
import { updateSalon } from '@/services/salon.service'
import type { CheckinQr } from '@/types/queue'

const props = defineProps<{ slug: string }>()

const qr = ref<CheckinQr | null>(null)
const loading = ref(true)
const regenerating = ref(false)
const error = ref<string | null>(null)
const tolerance = ref(15)
const savingTolerance = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    qr.value = (await fetchCheckinQr()).data
    tolerance.value = qr.value.late_tolerance_minutes
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

function download() {
  if (!qr.value) return
  const extension = qr.value.qr_code.startsWith('data:image/svg') ? 'svg' : 'png'
  const a = document.createElement('a')
  a.href = qr.value.qr_code
  a.download = `qr-arrivee-${props.slug}.${extension}`
  a.click()
}

async function regenerate() {
  const confirmed = window.confirm(
    'Générer un nouveau QR code d’arrivée ? L’ancien QR affiché au salon ne fonctionnera plus : il faudra imprimer le nouveau.',
  )
  if (!confirmed) return
  regenerating.value = true
  try {
    qr.value = (await regenerateCheckinQr()).data
    toast.success('Nouveau QR d’arrivée généré')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    regenerating.value = false
  }
}

/** Retard toléré avant que le client doive choisir (reprogrammer ou passer après le dernier). */
async function saveTolerance() {
  const minutes = Math.round(Number(tolerance.value))
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 60) {
    toast.error('La tolérance doit être comprise entre 0 et 60 minutes.')
    return
  }
  savingTolerance.value = true
  try {
    await updateSalon({ late_tolerance_minutes: minutes })
    if (qr.value) qr.value = { ...qr.value, late_tolerance_minutes: minutes }
    toast.success('Tolérance de retard enregistrée')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    savingTolerance.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mt-6 border-t border-border pt-6" data-testid="checkin-qr-card">
    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">File d’attente</p>
    <h2 class="mt-1 text-lg font-semibold text-foreground">QR code d’arrivée</h2>
    <p class="mt-2 text-sm text-muted-foreground">
      À afficher à l’accueil. Les clients le scannent en arrivant pour rejoindre la file et suivre
      leur position. Retard toléré :
      <strong>{{ qr?.late_tolerance_minutes ?? 15 }} min</strong>.
    </p>

    <Skeleton v-if="loading" class="mt-5 h-[220px] w-full rounded-xl" />

    <p
      v-else-if="error"
      class="mt-5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-800"
    >
      {{ error }}
    </p>

    <template v-else-if="qr">
      <div
        class="mt-5 flex justify-center rounded-xl border border-primary-200 bg-primary-50/50 p-4"
      >
        <img
          :src="qr.qr_code"
          alt="QR code d’arrivée"
          width="300"
          height="300"
          class="h-auto w-full max-w-[220px] rounded-lg bg-white p-2 shadow-sm"
        />
      </div>

      <form class="mt-5 space-y-2" @submit.prevent="saveTolerance">
        <Label for="late-tolerance" class="text-sm font-medium">Retard toléré (minutes)</Label>
        <div class="flex gap-2">
          <Input
            id="late-tolerance"
            v-model.number="tolerance"
            type="number"
            min="0"
            max="60"
            class="w-24"
          />
          <Button
            type="submit"
            variant="outline"
            class="cursor-pointer"
            :disabled="savingTolerance || tolerance === qr.late_tolerance_minutes"
          >
            Enregistrer
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          Au-delà, le client choisit : passer après le dernier ou revenir un autre jour à la même
          heure.
        </p>
      </form>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col">
        <Button
          type="button"
          class="flex-1 cursor-pointer gap-2 bg-primary-600 hover:bg-primary-800"
          @click="download"
        >
          <IconDownload :size="16" />
          Télécharger pour impression
        </Button>
        <Button
          type="button"
          variant="outline"
          class="flex-1 cursor-pointer gap-2"
          :disabled="regenerating"
          @click="regenerate"
        >
          <IconRefresh :size="16" :class="regenerating && 'animate-spin'" />
          Générer un nouveau QR
        </Button>
      </div>
    </template>
  </div>
</template>
