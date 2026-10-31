<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconLoader2, IconPhone, IconUser } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api'
import { formatCFA, formatTime } from '@/lib/utils'
import type { WalkInOptions, WalkInPayload, WalkInService } from '@/types/queue'

/**
 * Client sans rendez-vous : prestation → coiffeur (ou premier disponible) → nom et téléphone.
 * Utilisé sur la page publique d'arrivée et dans la fenêtre de l'accueil.
 */
const props = defineProps<{
  services: WalkInService[]
  fetchOptions: (serviceId: string) => Promise<WalkInOptions>
  submitting?: boolean
  submitLabel?: string
}>()

const emit = defineEmits<{ submit: [payload: WalkInPayload] }>()

/** Valeur du choix « premier coiffeur disponible ». */
const FIRST_AVAILABLE = 'first'

const serviceId = ref('')
const stylistChoice = ref(FIRST_AVAILABLE)
const name = ref('')
const phone = ref('')
const options = ref<WalkInOptions | null>(null)
const loadingOptions = ref(false)
const optionsError = ref<string | null>(null)

const selectedService = computed(() => props.services.find((s) => s.id === serviceId.value) ?? null)
const nothingAvailable = computed(
  () => options.value !== null && options.value.first_available === null,
)
const canSubmit = computed(
  () =>
    serviceId.value !== '' &&
    options.value !== null &&
    !nothingAvailable.value &&
    name.value.trim().length >= 2 &&
    phone.value.trim().length >= 8 &&
    !props.submitting,
)

watch(serviceId, async (id) => {
  options.value = null
  optionsError.value = null
  stylistChoice.value = FIRST_AVAILABLE
  if (!id) return
  loadingOptions.value = true
  try {
    options.value = await props.fetchOptions(id)
  } catch (e) {
    optionsError.value = getApiErrorMessage(e)
  } finally {
    loadingOptions.value = false
  }
})

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    service_id: serviceId.value,
    stylist_id: stylistChoice.value === FIRST_AVAILABLE ? null : stylistChoice.value,
    name: name.value.trim(),
    phone: phone.value.trim(),
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <!-- Prestation -->
    <div class="space-y-2">
      <Label for="walkin-service" class="text-sm font-medium">Prestation</Label>
      <select
        id="walkin-service"
        v-model="serviceId"
        class="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      >
        <option value="" disabled>Choisir une prestation</option>
        <option v-for="service in services" :key="service.id" :value="service.id">
          {{ service.name }} · {{ service.duration_min }} min · {{ formatCFA(service.price) }}
        </option>
      </select>
    </div>

    <!-- Coiffeur -->
    <div v-if="selectedService" class="space-y-2">
      <p class="text-sm font-medium text-foreground">Coiffeur</p>
      <p v-if="loadingOptions" class="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <IconLoader2 :size="16" class="animate-spin" /> Calcul de l’attente…
      </p>
      <p v-else-if="optionsError" class="text-sm text-danger-800">{{ optionsError }}</p>
      <p
        v-else-if="nothingAvailable"
        class="rounded-lg border border-warning-600/30 bg-warning-50 px-3 py-2 text-sm text-warning-800"
      >
        Plus de place aujourd’hui avant la fermeture pour cette prestation.
      </p>
      <div v-else-if="options" class="space-y-2" role="radiogroup">
        <label
          v-if="options.first_available"
          class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors"
          :class="
            stylistChoice === FIRST_AVAILABLE
              ? 'border-primary-400 bg-primary-50/60'
              : 'border-border'
          "
        >
          <input v-model="stylistChoice" type="radio" :value="FIRST_AVAILABLE" class="mt-1" />
          <span class="text-sm">
            <span class="font-medium text-foreground">Premier coiffeur disponible</span>
            <span class="block text-muted-foreground">
              {{ options.first_available.stylist.name }} — passage vers
              <strong>{{ formatTime(options.first_available.estimated_start_at) }}</strong>
            </span>
          </span>
        </label>
        <label
          v-for="option in options.stylists"
          :key="option.stylist.id"
          class="flex items-start gap-3 rounded-xl border p-3 transition-colors"
          :class="[
            stylistChoice === option.stylist.id
              ? 'border-primary-400 bg-primary-50/60'
              : 'border-border',
            option.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
          ]"
        >
          <input
            v-model="stylistChoice"
            type="radio"
            :value="option.stylist.id"
            :disabled="!option.available"
            class="mt-1"
          />
          <span class="text-sm">
            <span class="font-medium text-foreground">{{ option.stylist.name }}</span>
            <span class="block text-muted-foreground">
              <template v-if="option.available">
                {{
                  option.people_ahead === 0
                    ? 'Personne avant vous'
                    : `${option.people_ahead} avant vous`
                }}
                — passage vers {{ formatTime(option.estimated_start_at) }}
              </template>
              <template v-else>Complet aujourd’hui</template>
            </span>
          </span>
        </label>
      </div>
    </div>

    <!-- Identité -->
    <template v-if="options && !nothingAvailable">
      <div class="space-y-2">
        <Label for="walkin-name" class="text-sm font-medium">Nom</Label>
        <div class="relative">
          <IconUser
            :size="16"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input id="walkin-name" v-model="name" placeholder="Votre nom" class="pl-9" required />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="walkin-phone" class="text-sm font-medium">Téléphone</Label>
        <div class="relative">
          <IconPhone
            :size="16"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="walkin-phone"
            v-model="phone"
            type="tel"
            placeholder="07 08 11 22 33"
            class="pl-9"
            required
          />
        </div>
      </div>
      <Button type="submit" class="w-full cursor-pointer" :disabled="!canSubmit">
        <IconLoader2 v-if="submitting" :size="16" class="mr-2 animate-spin" />
        {{ submitLabel ?? 'Rejoindre la file' }}
      </Button>
    </template>
  </form>
</template>
