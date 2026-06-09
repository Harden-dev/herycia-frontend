<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconBuildingStore, IconLock, IconPhone, IconUser } from '@tabler/icons-vue'
import AuthField from '@/components/auth/AuthField.vue'
import { ApiRequestError } from '@/lib/api'
import { SALON_CITIES } from '@/lib/permissions'
import { getSelectedPlanCode, SELECTED_PLAN_KEY } from '@/lib/subscription'
import { fetchPublicPlans } from '@/services/plans.service'
import { useAuthStore } from '@/stores/auth'
import type { PublicPlan } from '@/types/plan'
import type { SalonPlanCode } from '@/types/plan'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const salon_name = ref('')
const admin_name = ref('')
const phone = ref('')
const whatsapp_number = ref('')
const city = ref('Abidjan')
const password = ref('')
const password_confirmation = ref('')
const password_confirmation_error = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const planCode = ref<SalonPlanCode>('basic')
const availablePlans = ref<PublicPlan[]>([])

const selectedPlan = computed(() =>
  availablePlans.value.find((p) => p.code === planCode.value),
)

function resolvePlanCode() {
  planCode.value = getSelectedPlanCode(
    route.query.plan as string,
    localStorage.getItem(SELECTED_PLAN_KEY),
  )
  localStorage.setItem(SELECTED_PLAN_KEY, planCode.value)
}

function clearFieldError(field: string) {
  if (!fieldErrors.value[field]) return
  const next = { ...fieldErrors.value }
  delete next[field]
  fieldErrors.value = next
}

function applyValidationErrors(errors: Record<string, string> | null) {
  fieldErrors.value = errors ?? {}
}

onMounted(async () => {
  resolvePlanCode()
  try {
    const response = await fetchPublicPlans()
    if (response.success) availablePlans.value = response.data
  } catch {
    // plans optionnels pour le récap — fallback sur planCode
  }
})

watch(
  () => route.query.plan,
  () => resolvePlanCode(),
)

watch(password_confirmation, (newPassword) => {
  password_confirmation_error.value =
    newPassword !== password.value ? 'Les mots de passe ne correspondent pas' : ''
  clearFieldError('password_confirmation')
})

watch(salon_name, () => clearFieldError('salon_name'))
watch(admin_name, () => clearFieldError('admin_name'))
watch(phone, () => clearFieldError('phone'))
watch(whatsapp_number, () => clearFieldError('whatsapp_number'))
watch(city, () => clearFieldError('city'))
watch(password, () => {
  clearFieldError('password')
  if (password_confirmation.value) {
    password_confirmation_error.value =
      password_confirmation.value !== password.value
        ? 'Les mots de passe ne correspondent pas'
        : ''
  }
})

async function onSubmit() {
  if (password.value !== password_confirmation.value) {
    password_confirmation_error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  submitting.value = true
  formError.value = null
  fieldErrors.value = {}
  password_confirmation_error.value = ''
  authStore.error = null

  try {
    await authStore.register({
      salon_name: salon_name.value,
      city: city.value,
      whatsapp_number: whatsapp_number.value,
      admin_name: admin_name.value,
      phone: phone.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      plan_code: planCode.value,
    })
    await router.push('/dashboard')
  } catch (e) {
    if (e instanceof ApiRequestError) {
      formError.value = e.message
      applyValidationErrors(e.fieldErrors)
      if (fieldErrors.value.password_confirmation) {
        password_confirmation_error.value = fieldErrors.value.password_confirmation
      }
    } else {
      formError.value = authStore.error
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <p
      v-if="formError"
      class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800"
      role="alert"
    >
      {{ formError }}
    </p>

    <p v-if="fieldErrors.plan_code" class="text-xs text-danger-600">{{ fieldErrors.plan_code }}</p>

    <div
      v-if="selectedPlan"
      class="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm"
    >
      <p class="font-medium text-primary-900">
        Plan {{ selectedPlan.name }} — {{ selectedPlan.price_label }}
      </p>
      <p class="mt-0.5 text-xs text-primary-700/80">
        {{ selectedPlan.max_employees_label }} · 7 jours d'essai inclus
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AuthField
        id="salon_name"
        v-model="salon_name"
        label="Nom du salon"
        placeholder="Ex: Michel Hair"
        required
        :icon="IconBuildingStore"
        :error="fieldErrors.salon_name"
      />
      <AuthField
        id="admin_name"
        v-model="admin_name"
        label="Nom du gérant"
        placeholder="Ex: Michel Kouassi"
        required
        :icon="IconUser"
        :error="fieldErrors.admin_name"
      />
      <AuthField
        id="whatsapp_number"
        v-model="whatsapp_number"
        label="WhatsApp du salon"
        type="tel"
        placeholder="0748754918"
        required
        :icon="IconPhone"
        :error="fieldErrors.whatsapp_number"
      />
      <AuthField
        id="phone"
        v-model="phone"
        label="Téléphone de connexion"
        type="tel"
        placeholder="0748754918"
        required
        :icon="IconPhone"
        :error="fieldErrors.phone"
      />
      <div class="space-y-1.5 sm:col-span-2">
        <label for="city" class="text-sm font-medium text-foreground">Ville</label>
        <select
          id="city"
          v-model="city"
          required
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          :class="fieldErrors.city && 'border-danger-500'"
          :aria-invalid="fieldErrors.city ? true : undefined"
        >
          <option v-for="c in SALON_CITIES" :key="c" :value="c">{{ c }}</option>
        </select>
        <p v-if="fieldErrors.city" class="text-xs text-danger-600">{{ fieldErrors.city }}</p>
      </div>
      <AuthField
        id="password"
        v-model="password"
        label="Mot de passe"
        type="password"
        placeholder="Minimum 8 caractères"
        required
        :icon="IconLock"
        :error="fieldErrors.password"
      />
      <AuthField
        id="password_confirmation"
        v-model="password_confirmation"
        label="Confirmation"
        type="password"
        required
        :icon="IconLock"
        :error="fieldErrors.password_confirmation || password_confirmation_error || undefined"
      />
    </div>

    <button type="submit" class="auth-submit mt-2 cursor-pointer" :disabled="submitting">
      {{ submitting ? 'Création…' : `Créer mon compte — ${selectedPlan?.name ?? 'Basic'}` }}
    </button>
  </form>
</template>
