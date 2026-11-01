<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconDoorEnter, IconDownload, IconRefresh } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import QrCodePanel from '@/components/settings/QrCodePanel.vue'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { fetchCheckinQr, regenerateCheckinQr } from '@/services/queue.service'
import type { CheckinQr } from '@/types/queue'

const props = defineProps<{ slug: string }>()

const qr = ref<CheckinQr | null>(null)
const loading = ref(true)
const regenerating = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    qr.value = (await fetchCheckinQr()).data
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
  toast.success('QR d’arrivée téléchargé')
}

async function regenerate() {
  const confirmed = window.confirm(
    'Générer un nouveau QR code d’arrivée ? L’ancien QR affiché au salon ne fonctionnera plus : il faudra imprimer le nouveau.',
  )
  if (!confirmed) return
  regenerating.value = true
  try {
    qr.value = (await regenerateCheckinQr()).data
    toast.success('Nouveau QR d’arrivée généré : pensez à le réimprimer')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    regenerating.value = false
  }
}

onMounted(load)
</script>

<template>
  <QrCodePanel
    :icon="IconDoorEnter"
    moment="Au salon"
    title="QR d’arrivée"
    description="Vos clients le scannent en arrivant pour rejoindre la file et suivre leur position."
    :usages="['Comptoir d’accueil ou entrée du salon', 'Uniquement sur place, jamais en ligne']"
    :qr-src="qr?.qr_code"
    qr-alt="QR code d’arrivée au salon"
    :loading="loading"
    :error="error"
    tone="neutral"
    data-testid="checkin-qr-card"
  >
    <template #actions>
      <Button
        type="button"
        class="cursor-pointer gap-2 bg-primary-600 hover:bg-primary-800 sm:w-auto"
        :disabled="!qr"
        @click="download"
      >
        <IconDownload :size="16" />
        Télécharger le QR
      </Button>
      <Button
        type="button"
        variant="ghost"
        class="cursor-pointer gap-2 text-muted-foreground sm:ml-auto"
        :disabled="!qr || regenerating"
        title="L’ancien QR ne fonctionnera plus"
        @click="regenerate"
      >
        <IconRefresh :size="16" :class="regenerating && 'animate-spin'" />
        Régénérer
      </Button>
    </template>
  </QrCodePanel>
</template>
