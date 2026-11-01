<script setup lang="ts">
import { ref } from 'vue'
import { IconCalendarEvent, IconCheck, IconCopy, IconDownload } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import QrCodePanel from '@/components/settings/QrCodePanel.vue'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { downloadBookingQr } from '@/services/salon.service'

const props = defineProps<{
  slug: string
  bookingLink: string
  qrCode?: string | null
}>()

const downloading = ref(false)
const copied = ref(false)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.bookingLink)
    copied.value = true
    toast.success('Lien copié')
    window.setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.error('Copie impossible : sélectionnez le lien et copiez-le manuellement.')
  }
}

async function download() {
  downloading.value = true
  try {
    const blob = await downloadBookingQr()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-reservation-${props.slug}.png`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('QR de réservation téléchargé')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <QrCodePanel
    :icon="IconCalendarEvent"
    moment="Avant la visite"
    title="QR de réservation"
    description="Vos clients le scannent pour prendre rendez-vous en ligne, où qu’ils soient."
    :usages="['Réseaux sociaux et statut WhatsApp', 'Flyers, cartes de visite, vitrine']"
    :qr-src="qrCode"
    qr-alt="QR code de réservation en ligne"
    data-testid="booking-qr-card"
  >
    <template #details>
      <div class="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 py-1 pl-3 pr-1">
        <span class="min-w-0 flex-1 truncate font-mono text-xs text-foreground" :title="bookingLink">
          {{ bookingLink }}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="shrink-0 cursor-pointer gap-1.5"
          :aria-label="copied ? 'Lien copié' : 'Copier le lien de réservation'"
          @click="copyLink"
        >
          <component :is="copied ? IconCheck : IconCopy" :size="16" />
          {{ copied ? 'Copié' : 'Copier' }}
        </Button>
      </div>
    </template>

    <template #actions>
      <Button
        type="button"
        class="cursor-pointer gap-2 bg-primary-600 hover:bg-primary-800 sm:w-auto"
        :disabled="downloading"
        @click="download"
      >
        <IconDownload :size="16" />
        {{ downloading ? 'Téléchargement…' : 'Télécharger le QR' }}
      </Button>
    </template>
  </QrCodePanel>
</template>
