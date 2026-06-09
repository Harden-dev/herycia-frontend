<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractValidationErrors, getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { createAdminPlan, updateAdminPlan } from '@/services/admin.service'
import type { AdminPlan, CreateAdminPlanPayload } from '@/types/admin'

const open = defineModel<boolean>('open', { default: false })
const plan = defineModel<AdminPlan | null>('plan', { default: null })

const emit = defineEmits<{ saved: [] }>()

const isEdit = ref(false)
const name = ref('')
const code = ref('')
const priceFcfa = ref(0)
const maxEmployees = ref(5)
const maxServices = ref(15)
const hasOnlineBooking = ref(true)
const hasAnalytics = ref(false)
const hasMultiBranch = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

function resetForm() {
  name.value = ''
  code.value = ''
  priceFcfa.value = 0
  maxEmployees.value = 5
  maxServices.value = 15
  hasOnlineBooking.value = true
  hasAnalytics.value = false
  hasMultiBranch.value = false
  error.value = null
  fieldErrors.value = {}
}

watch([open, plan], () => {
  if (!open.value) return
  if (plan.value) {
    isEdit.value = true
    name.value = plan.value.name
    code.value = plan.value.code
    priceFcfa.value = plan.value.price_fcfa
    maxEmployees.value = plan.value.max_employees
    maxServices.value = plan.value.max_services
    hasOnlineBooking.value = plan.value.has_online_booking
    hasAnalytics.value = plan.value.has_analytics
    hasMultiBranch.value = plan.value.has_multi_branch
  } else {
    isEdit.value = false
    resetForm()
  }
})

function buildPayload(): CreateAdminPlanPayload {
  return {
    name: name.value.trim(),
    code: code.value.trim(),
    price_fcfa: Number(priceFcfa.value),
    max_employees: Number(maxEmployees.value),
    max_services: Number(maxServices.value),
    has_online_booking: hasOnlineBooking.value,
    has_analytics: hasAnalytics.value,
    has_multi_branch: hasMultiBranch.value,
  }
}

async function onSubmit() {
  loading.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    const payload = buildPayload()
    const response = isEdit.value && plan.value
      ? await updateAdminPlan(plan.value.id, payload)
      : await createAdminPlan(payload)
    if (!response.success) throw new Error(response.message)
    toast.success(response.message)
    open.value = false
    emit('saved')
  } catch (e) {
    fieldErrors.value = extractValidationErrors(e as never) ?? {}
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier le plan' : 'Créer un plan' }}</DialogTitle>
      </DialogHeader>

      <p v-if="error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
        {{ error }}
      </p>

      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="onSubmit">
        <div class="space-y-2 sm:col-span-2">
          <Label for="plan-name">Nom</Label>
          <Input id="plan-name" v-model="name" required />
        </div>
        <div class="space-y-2">
          <Label for="plan-code">Code</Label>
          <Input id="plan-code" v-model="code" required :disabled="isEdit" />
        </div>
        <div class="space-y-2">
          <Label for="plan-price">Prix (FCFA)</Label>
          <Input id="plan-price" v-model.number="priceFcfa" type="number" min="0" required />
        </div>
        <div class="space-y-2">
          <Label for="plan-employees">Employés max</Label>
          <Input id="plan-employees" v-model.number="maxEmployees" type="number" min="1" required />
        </div>
        <div class="space-y-2">
          <Label for="plan-services">Services max</Label>
          <Input id="plan-services" v-model.number="maxServices" type="number" min="1" required />
        </div>

        <div class="flex flex-col gap-3 sm:col-span-2">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="hasOnlineBooking" type="checkbox" class="rounded border-border" />
            Réservation en ligne
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="hasAnalytics" type="checkbox" class="rounded border-border" />
            Analytics
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="hasMultiBranch" type="checkbox" class="rounded border-border" />
            Multi-succursales
          </label>
        </div>

        <DialogFooter class="sm:col-span-2">
          <Button type="button" variant="outline" @click="open = false">Annuler</Button>
          <Button
            type="submit"
            class="bg-primary-600 text-white hover:bg-primary-800"
            :disabled="loading"
          >
            {{ loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
