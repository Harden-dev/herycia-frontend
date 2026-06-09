<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingSuccessOverlay, {
  type BookingSuccessRecap,
} from '@/components/booking/BookingSuccessOverlay.vue'
import BookingFormPreview from '@/components/booking/BookingFormPreview.vue'
import PublicBookingForm from '@/components/booking/PublicBookingForm.vue'
import PublicSalonBrand from '@/components/booking/PublicSalonBrand.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { getRdvTrackPath, pathFromTrackingLink } from '@/lib/booking'
import { createPublicBooking, fetchPublicSalon } from '@/services/booking.service'
import { isoToDMY } from '@/lib/utils'
import type { PublicSalonBooking } from '@/types/booking'
import type { CreatePublicBookingPayload } from '@/types/booking'
import '@/assets/booking.css'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const salon = ref<PublicSalonBooking | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const showSuccess = ref(false)
const successRecap = ref<BookingSuccessRecap | null>(null)
const pendingTrackPath = ref<string | null>(null)

const hasBookingSetup = computed(
  () => (salon.value?.services.length ?? 0) > 0 && (salon.value?.employees.length ?? 0) > 0,
)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetchPublicSalon(slug)
    if (!response.success) throw new Error(response.message)
    salon.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})

function buildRecap(
  payload: CreatePublicBookingPayload,
  salonData: PublicSalonBooking,
): BookingSuccessRecap {
  const service = salonData.services.find((s) => s.id === payload.service_id)
  const employee = salonData.employees.find((e) => e.id === payload.user_id)
  return {
    salonName: salonData.name,
    clientName: payload.client_name,
    serviceName: service?.name ?? 'Service',
    employeeName: employee?.name ?? 'Coiffeur',
    dateLabel: isoToDMY(payload.date),
    timeLabel: payload.time.slice(0, 5),
    price: service?.price,
    durationMin: service?.duration_min,
  }
}

async function onSubmit(payload: CreatePublicBookingPayload) {
  if (!salon.value) return
  submitting.value = true
  error.value = null
  try {
    const response = await createPublicBooking(slug, payload)
    if (!response.success) throw new Error(response.message)
    const created = response.data
    const trackPath =
      (created?.tracking_link && pathFromTrackingLink(created.tracking_link)) ||
      (created?.tracking_token && getRdvTrackPath(created.tracking_token)) ||
      null

    successRecap.value = buildRecap(payload, salon.value)
    pendingTrackPath.value = trackPath
    showSuccess.value = true
  } catch (e) {
    const msg = getApiErrorMessage(e)
    error.value = msg
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

function onSuccessContinue() {
  showSuccess.value = false
  if (pendingTrackPath.value) {
    router.push(pendingTrackPath.value)
  }
}
</script>

<template>
  <div class="booking-page min-h-screen bg-background lg:h-dvh lg:overflow-hidden">
    <div class="booking-split lg:grid lg:h-full lg:grid-cols-2">
      <!-- Gauche — formulaire réel (fixe, sans scroll) -->
      <main
        class="booking-split-form flex h-full flex-col justify-center overflow-hidden px-5 py-8 md:px-8 lg:px-10 lg:py-0 xl:px-12"
      >
        <div class="mx-auto w-full max-w-md lg:max-w-[26rem]">
          <template v-if="loading">
            <div class="mb-6 flex items-center gap-3">
              <Skeleton class="h-10 w-10 shrink-0 rounded-xl" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-24" />
              </div>
            </div>
            <Skeleton class="mb-3 h-8 w-52" />
            <Skeleton class="mb-8 h-4 w-72" />
            <div class="flex flex-col gap-3">
              <Skeleton v-for="i in 7" :key="i" class="h-11 w-full rounded-xl" />
            </div>
          </template>

          <template v-else-if="error && !salon">
            <p class="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-800">{{ error }}</p>
          </template>

          <template v-else-if="salon">
            <PublicSalonBrand
              class="mb-6 booking-fade-up"
              :name="salon.name"
              :logo-url="salon.logo_url"
              size="sm"
            />

            <div class="booking-fade-up booking-fade-up-delay-1">
              <h1 class="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                Prendre rendez-vous
              </h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Choisissez votre service et réservez en quelques clics.
              </p>
            </div>

            <p
              v-if="error"
              class="booking-fade-up booking-fade-up-delay-1 mt-4 rounded-xl bg-danger-50 px-4 py-2.5 text-sm text-danger-800"
            >
              {{ error }}
            </p>

            <div
              v-if="!hasBookingSetup"
              class="booking-fade-up booking-fade-up-delay-1 mt-6 rounded-xl border border-border bg-secondary/60 px-4 py-4"
            >
              <p class="text-sm text-muted-foreground">
                Ce salon n'a pas encore configuré ses services ou coiffeurs.
              </p>
            </div>

            <div
              v-else
              class="booking-form-card booking-fade-up booking-fade-up-delay-2 mt-5 rounded-2xl border border-border bg-card p-5 lg:p-6"
            >
              <PublicBookingForm
                compact
                :employees="salon.employees"
                :services="salon.services"
                :loading="submitting"
                @submit="onSubmit"
              />
            </div>
          </template>
        </div>
      </main>

      <!-- Droite — comment prendre un RDV + aperçu animé -->
      <section
        class="booking-hero booking-split-hero relative flex h-full flex-col justify-center overflow-y-auto px-5 py-12 md:px-8 lg:px-10 lg:py-10 xl:px-12"
      >
        <div class="booking-hero-glow" aria-hidden="true" />
        <div
          class="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative z-10 mx-auto w-full max-w-md lg:max-w-lg">
          <PublicSalonBrand
            v-if="salon"
            class="booking-fade-up"
            :name="salon.name"
            :logo-url="salon.logo_url"
            variant="dark"
          />

          <div class="mt-0 lg:mt-8 booking-fade-up booking-fade-up-delay-1">
            <h2 class="text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
              Comment prendre un RDV
            </h2>
            <p class="mt-2 text-sm text-primary-100/75">
              Quatre étapes simples pour réserver chez {{ salon?.name ?? 'votre salon' }}.
            </p>
          </div>

          <BookingFormPreview class="mt-8" />
        </div>

        <div class="booking-hero-accent" aria-hidden="true" />
      </section>
    </div>

    <Transition name="booking-success-overlay">
      <BookingSuccessOverlay
        v-if="showSuccess && successRecap"
        :recap="successRecap"
        @continue="onSuccessContinue"
      />
    </Transition>
  </div>
</template>
