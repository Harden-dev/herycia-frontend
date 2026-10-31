<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IconCopy, IconDownload, IconUpload } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SettingsSubscriptionCard from '@/components/subscription/SettingsSubscriptionCard.vue'
import CheckinQrCard from '@/components/queue/CheckinQrCard.vue'
import { usePaymentCallback } from '@/composables/usePaymentCallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { getApiErrorMessage } from '@/lib/api'
import { initials, resolveMediaUrl } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { downloadBookingQr, fetchSalon, updateSalon, uploadSalonLogo } from '@/services/salon.service'
import type { SalonDetail } from '@/types/salon'
import { SALON_CITIES } from '@/lib/permissions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const authStore = useAuthStore()
const { handlePaymentCallback } = usePaymentCallback()
const salon = ref<SalonDetail | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingLogo = ref(false)
const downloadingQr = ref(false)
const error = ref<string | null>(null)
const logoInputRef = ref<HTMLInputElement | null>(null)

const LOGO_MAX_BYTES = 2048 * 1024
const LOGO_ACCEPT = 'image/jpeg,image/png,image/jpg,image/webp'

const name = ref('')
const phone = ref('')
const whatsapp = ref('')
const city = ref('')
const address = ref('')

const logoSrc = computed(() => resolveMediaUrl(salon.value?.logo_url))

function syncSalonBranding(data: SalonDetail) {
  authStore.updateSalonBranding({
    name: data.name,
    slug: data.slug,
    booking_link: data.booking_link,
    logo_url: data.logo_url ?? null,
  })
}

onMounted(async () => {
  if (authStore.role !== 'admin') {
    loading.value = false
    return
  }
  await handlePaymentCallback()
  loading.value = true
  try {
    const response = await fetchSalon()
    if (!response.success) throw new Error(response.message)
    salon.value = response.data
    syncSalonBranding(response.data)
    name.value = response.data.name
    phone.value = response.data.phone ?? ''
    whatsapp.value = response.data.whatsapp_number
    city.value = response.data.city
    address.value = response.data.address ?? ''
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value = null
  try {
    const response = await updateSalon({
      name: name.value,
      phone: phone.value || null,
      whatsapp_number: whatsapp.value,
      city: city.value,
      address: address.value || null,
    })
    if (!response.success) throw new Error(response.message)
    salon.value = response.data
    syncSalonBranding(response.data)
    toast.success(response.message)
  } catch (e) {
    const msg = getApiErrorMessage(e)
    error.value = msg
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

async function copyBookingLink() {
  const link = salon.value?.booking_link ?? authStore.user?.salon?.booking_link
  if (!link) return
  await navigator.clipboard.writeText(link)
  toast.success('Lien copié')
}

function validateLogoFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!allowed.includes(file.type)) {
    return 'Format accepté : JPEG, PNG ou WebP.'
  }
  if (file.size > LOGO_MAX_BYTES) {
    return 'Le fichier ne doit pas dépasser 2 Mo.'
  }
  return null
}

function openLogoPicker() {
  logoInputRef.value?.click()
}

async function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const validationError = validateLogoFile(file)
  if (validationError) {
    toast.error(validationError)
    return
  }

  uploadingLogo.value = true
  try {
    const response = await uploadSalonLogo(file)
    if (!response.success) throw new Error(response.message)
    salon.value = response.data
    syncSalonBranding(response.data)
    toast.success(response.message || 'Logo mis à jour')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    uploadingLogo.value = false
  }
}

async function downloadQr() {
  downloadingQr.value = true
  try {
    const blob = await downloadBookingQr()
    const url = URL.createObjectURL(blob)
    const slug = salon.value?.slug ?? 'salon'
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-qr-${slug}.png`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('QR téléchargé')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    downloadingQr.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader title="Paramètres" description="Configuration du salon" />

    <p v-if="authStore.role !== 'admin'" class="text-sm text-muted-foreground">
      Seul l'administrateur peut modifier les paramètres du salon.
    </p>

    <template v-else>
      <SettingsSubscriptionCard />

      <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
        {{ error }}
      </p>

      <template v-if="loading">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton class="h-80 w-full rounded-xl" />
          <Skeleton class="h-80 w-full rounded-xl" />
        </div>
      </template>

      <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <form
          class="space-y-4 rounded-xl border border-border bg-card p-6"
          @submit.prevent="save"
        >
          <div class="rounded-xl border border-border bg-secondary/30 p-4">
            <Label class="text-sm font-medium text-foreground">Logo du salon</Label>
            <p class="mt-1 text-xs text-muted-foreground">
              JPEG, PNG ou WebP — 2 Mo max.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-4">
              <div
                class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-primary-50"
              >
                <img
                  v-if="logoSrc"
                  :src="logoSrc"
                  :alt="`Logo ${salon?.name ?? 'salon'}`"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-lg font-medium text-primary-800">
                  {{ initials(salon?.name ?? 'S') }}
                </span>
              </div>
              <div class="flex flex-col gap-2">
                <input
                  ref="logoInputRef"
                  type="file"
                  class="hidden"
                  :accept="LOGO_ACCEPT"
                  @change="onLogoSelected"
                />
                <Button
                  type="button"
                  variant="outline"
                  class="cursor-pointer gap-2"
                  :disabled="uploadingLogo"
                  @click="openLogoPicker"
                >
                  <IconUpload :size="16" />
                  {{ uploadingLogo ? 'Envoi en cours…' : 'Changer le logo' }}
                </Button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="salon-name">Nom du salon</Label>
            <Input id="salon-name" v-model="name" required />
          </div>
          <div class="space-y-2">
            <Label for="salon-wa">WhatsApp</Label>
            <Input id="salon-wa" v-model="whatsapp" type="tel" required />
          </div>
          <div class="space-y-2">
            <Label for="salon-phone">Téléphone salon</Label>
            <Input id="salon-phone" v-model="phone" type="tel" />
          </div>
          <div class="space-y-2">
            <Label>Ville</Label>
            <Select v-model="city">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in SALON_CITIES" :key="c" :value="c">{{ c }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="salon-address">Adresse</Label>
            <Input id="salon-address" v-model="address" />
          </div>

          <Button
            type="submit"
            class="w-full cursor-pointer bg-primary-600 hover:bg-primary-800"
            :disabled="saving"
          >
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </Button>
        </form>

        <aside
          v-if="salon?.booking_link"
          class="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-6"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Réservation en ligne
          </p>
          <h2 class="mt-1 text-lg font-semibold text-foreground">Partager votre lien</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Le QR pointe vers la même page que votre lien public de réservation.
          </p>

          <div
            class="mt-5 flex justify-center rounded-xl border border-primary-200 bg-primary-50/50 p-4"
          >
            <img
              v-if="salon.booking_qr_code"
              :src="salon.booking_qr_code"
              alt="QR code réservation"
              width="300"
              height="300"
              class="h-auto w-full max-w-[220px] rounded-lg bg-white p-2 shadow-sm"
            />
            <p v-else class="py-8 text-center text-sm text-muted-foreground">
              QR temporairement indisponible.
              <br />
              Utilisez le lien ci-dessous.
            </p>
          </div>

          <div class="mt-4 space-y-2">
            <Label class="text-xs text-muted-foreground">Lien de réservation</Label>
            <p class="break-all rounded-lg border border-border bg-secondary/50 px-3 py-2 font-mono text-xs text-foreground">
              {{ salon.booking_link }}
            </p>
          </div>

          <div class="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button
              type="button"
              variant="outline"
              class="flex-1 cursor-pointer gap-2"
              @click="copyBookingLink"
            >
              <IconCopy :size="16" />
              Copier le lien
            </Button>
            <Button
              type="button"
              class="flex-1 cursor-pointer gap-2 bg-primary-600 hover:bg-primary-800"
              :disabled="downloadingQr"
              @click="downloadQr"
            >
              <IconDownload :size="16" />
              {{ downloadingQr ? 'Téléchargement…' : 'Télécharger le QR' }}
            </Button>
          </div>
          <CheckinQrCard :slug="salon.slug" />
        </aside>
      </div>
    </template>
  </div>
</template>
