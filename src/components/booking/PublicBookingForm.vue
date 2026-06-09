<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconClock, IconLoader2 } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCFA } from '@/lib/utils'
import type { CreatePublicBookingPayload } from '@/types/booking'
import type { PublicBookingEmployee, PublicBookingService } from '@/types/booking'

const props = defineProps<{
  employees: PublicBookingEmployee[]
  services: PublicBookingService[]
  loading?: boolean
  horizontal?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreatePublicBookingPayload]
}>()

const clientName = ref('')
const clientPhone = ref('')
const date = ref('')
const time = ref('')
const userId = ref('')
const serviceId = ref('')

const selectedService = computed(() => props.services.find((s) => s.id === serviceId.value))

const canSubmit = computed(
  () =>
    clientName.value.trim() &&
    clientPhone.value.trim() &&
    date.value &&
    time.value &&
    userId.value &&
    serviceId.value,
)

function selectService(id: string) {
  if (props.loading) return
  serviceId.value = id
}

function selectEmployee(id: string) {
  if (props.loading) return
  userId.value = id
}

function onSubmit() {
  if (!canSubmit.value || props.loading) return
  emit('submit', {
    client_name: clientName.value.trim(),
    client_phone: clientPhone.value.trim(),
    service_id: serviceId.value,
    user_id: userId.value,
    date: date.value,
    time: time.value,
  })
}
</script>

<template>
  <form
    class="flex flex-col"
    :class="[
      compact ? 'gap-4' : 'gap-6',
      loading && 'booking-form-loading',
      horizontal && 'booking-form-layout-horizontal',
      compact && 'booking-form-compact',
    ]"
    @submit.prevent="onSubmit"
  >
    <div class="booking-form-block space-y-2">
      <Label>Service</Label>
      <div
        class="grid gap-2"
        :class="[
          horizontal ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2',
          compact && 'booking-form-services',
        ]"
      >
        <button
          v-for="service in services"
          :key="service.id"
          type="button"
          class="booking-service-card rounded-xl border border-border bg-card text-left"
          :class="[
            compact ? 'px-3 py-2' : 'px-4 py-3',
            serviceId === service.id && 'booking-service-card--selected',
          ]"
          :disabled="loading"
          @click="selectService(service.id)"
        >
          <p class="font-medium text-foreground" :class="compact ? 'text-xs' : 'text-sm'">
            {{ service.name }}
          </p>
          <p v-if="service.price" class="mt-0.5 text-xs text-primary-700">
            {{ formatCFA(service.price) }}
          </p>
        </button>
      </div>
      <Transition name="booking-service-meta">
        <p
          v-if="selectedService?.duration_min"
          class="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <IconClock :size="14" />
          Durée estimée : {{ selectedService.duration_min }} min
        </p>
      </Transition>
    </div>

    <div class="booking-form-row" :class="horizontal && 'grid grid-cols-1 gap-6 lg:grid-cols-2'">
      <div class="booking-form-block space-y-2 mb-4">
        <Label>Coiffeur</Label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="employee in employees"
            :key="employee.id"
            type="button"
            class="booking-employee-chip rounded-full border border-border bg-secondary font-medium text-foreground"
            :class="[
              compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              userId === employee.id && 'booking-employee-chip--selected',
            ]"
            :disabled="loading"
            @click="selectEmployee(employee.id)"
          >
            {{ employee.name }}
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4"
        :class="horizontal && 'booking-form-block'"
      >
        <div class="space-y-2">
          <Label for="booking-date">Date</Label>
          <Input id="booking-date" v-model="date" type="date" required :disabled="loading" />
        </div>
        <div class="space-y-2">
          <Label for="booking-time">Heure</Label>
          <Input id="booking-time" v-model="time" type="time" required :disabled="loading" />
        </div>
      </div>
    </div>

    <div class="booking-form-row" :class="horizontal && 'grid grid-cols-1 gap-4 sm:grid-cols-2'">
      <div class="space-y-2 mb-4">
        <Label for="client-name">Votre nom</Label>
        <Input
          id="client-name"
          v-model="clientName"
          placeholder="Ex. Michel"
          required
          :disabled="loading"
        />
      </div>
      <div class="space-y-2">
        <Label for="client-phone">Téléphone</Label>
        <Input
          id="client-phone"
          v-model="clientPhone"
          type="tel"
          placeholder="07 48 75 49 18"
          required
          :disabled="loading"
        />
      </div>
    </div>

    <Button
      type="submit"
      class="w-full bg-primary-600 hover:bg-primary-800"
      :class="[
        canSubmit && !loading && 'booking-btn-ready',
        horizontal && 'lg:max-w-md lg:mx-auto',
      ]"
      :disabled="!canSubmit || loading"
    >
      <IconLoader2 v-if="loading" :size="18" class="mr-2 animate-spin" />
      {{ loading ? 'Réservation en cours…' : 'Confirmer le rendez-vous' }}
    </Button>
  </form>
</template>
