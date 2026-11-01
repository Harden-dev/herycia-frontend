<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IconUpload } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SettingsSubscriptionCard from '@/components/subscription/SettingsSubscriptionCard.vue'
import BookingQrCard from '@/components/settings/BookingQrCard.vue'
import CheckinQrCard from '@/components/queue/CheckinQrCard.vue'
import LateToleranceCard from '@/components/queue/LateToleranceCard.vue'
import { usePaymentCallback } from '@/composables/usePaymentCallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { getApiErrorMessage } from '@/lib/api'
import { initials, resolveMediaUrl } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { fetchSalon, updateSalon, uploadSalonLogo } from '@/services/salon.service'
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
        <Skeleton class="h-72 w-full rounded-xl" />
        <div class="grid gap-6 xl:grid-cols-2">
          <Skeleton class="h-72 w-full rounded-xl" />
          <Skeleton class="h-72 w-full rounded-xl" />
        </div>
      </template>

      <template v-else>
        <!-- Informations du salon -->
        <section class="space-y-3" aria-labelledby="settings-salon">
          <div>
            <h2 id="settings-salon" class="text-lg font-semibold text-foreground">
              Informations du salon
            </h2>
            <p class="text-sm text-muted-foreground">
              Affichées sur votre page de réservation et dans les messages envoyés aux clients.
            </p>
          </div>

          <form class="rounded-xl border border-border bg-card" @submit.prevent="save">
            <div class="flex flex-wrap items-center gap-4 border-b border-border p-5">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-primary-50"
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
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-foreground">Logo du salon</p>
                <p class="text-xs text-muted-foreground">JPEG, PNG ou WebP — 2 Mo max.</p>
              </div>
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
                class="w-full cursor-pointer gap-2 sm:w-auto"
                :disabled="uploadingLogo"
                @click="openLogoPicker"
              >
                <IconUpload :size="16" />
                {{ uploadingLogo ? 'Envoi en cours…' : 'Changer le logo' }}
              </Button>
            </div>

            <div class="grid gap-4 p-5 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="salon-name">Nom du salon</Label>
                <Input id="salon-name" v-model="name" required />
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
                <Label for="salon-wa">WhatsApp</Label>
                <Input id="salon-wa" v-model="whatsapp" type="tel" required />
              </div>
              <div class="space-y-2">
                <Label for="salon-phone">Téléphone salon</Label>
                <Input id="salon-phone" v-model="phone" type="tel" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="salon-address">Adresse</Label>
                <Input id="salon-address" v-model="address" />
              </div>
            </div>

            <div class="flex justify-end border-t border-border p-4">
              <Button
                type="submit"
                class="w-full cursor-pointer bg-primary-600 hover:bg-primary-800 sm:w-auto"
                :disabled="saving"
              >
                {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
              </Button>
            </div>
          </form>
        </section>

        <!-- QR codes -->
        <section v-if="salon" class="space-y-3" aria-labelledby="settings-qr">
          <div>
            <h2 id="settings-qr" class="text-lg font-semibold text-foreground">Vos QR codes</h2>
            <p class="text-sm text-muted-foreground">
              Deux QR, deux moments : l’un pour réserver à distance, l’autre à afficher dans le
              salon pour signaler son arrivée.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <BookingQrCard
              v-if="salon.booking_link"
              :slug="salon.slug"
              :booking-link="salon.booking_link"
              :qr-code="salon.booking_qr_code"
            />
            <CheckinQrCard :slug="salon.slug" />
          </div>
        </section>

        <!-- File d'attente -->
        <section v-if="salon" class="space-y-3" aria-labelledby="settings-queue">
          <div>
            <h2 id="settings-queue" class="text-lg font-semibold text-foreground">
              File d’attente
            </h2>
            <p class="text-sm text-muted-foreground">
              Règles appliquées quand un client signale son arrivée.
            </p>
          </div>
          <LateToleranceCard
            :minutes="salon.late_tolerance_minutes ?? 15"
            @saved="(data) => (salon = data)"
          />
        </section>
      </template>
    </template>
  </div>
</template>
