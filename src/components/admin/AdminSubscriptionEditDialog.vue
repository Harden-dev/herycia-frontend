<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { extractValidationErrors, getApiErrorMessage } from '@/lib/api'
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/admin'
import { toast } from '@/lib/toast'
import { fetchAdminPlans, updateAdminSubscription } from '@/services/admin.service'
import type { AdminPlan, AdminSubscription, AdminSubscriptionStatus } from '@/types/admin'

const open = defineModel<boolean>('open', { default: false })
const subscription = defineModel<AdminSubscription | null>('subscription', { default: null })

const emit = defineEmits<{ saved: [] }>()

const plans = ref<AdminPlan[]>([])
const planId = ref('')
const status = ref<AdminSubscriptionStatus>('active')
const startedAt = ref('')
const endsAt = ref('')
const trialEndsAt = ref('')
const isTrial = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const statuses = Object.keys(SUBSCRIPTION_STATUS_LABELS) as AdminSubscriptionStatus[]

async function loadPlans() {
  const response = await fetchAdminPlans({ per_page: 100, include_archived: false })
  if (response.success) plans.value = response.data
}

onMounted(loadPlans)

watch(subscription, (sub) => {
  if (!sub) return
  planId.value = sub.plan_id
  status.value = sub.status
  startedAt.value = sub.started_at ?? ''
  endsAt.value = sub.ends_at ?? ''
  trialEndsAt.value = sub.trial_ends_at ?? ''
  isTrial.value = sub.is_trial
  error.value = null
  fieldErrors.value = {}
})

async function onSubmit() {
  if (!subscription.value) return
  loading.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    const response = await updateAdminSubscription(subscription.value.id, {
      plan_id: planId.value,
      status: status.value,
      started_at: startedAt.value,
      ends_at: endsAt.value || null,
      trial_ends_at: trialEndsAt.value || null,
      is_trial: isTrial.value,
    })
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
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier la souscription</DialogTitle>
      </DialogHeader>

      <p v-if="error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
        {{ error }}
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label>Plan</Label>
          <Select v-model="planId">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.name }} ({{ plan.code }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Statut</Label>
          <Select v-model="status">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in statuses" :key="s" :value="s">
                {{ SUBSCRIPTION_STATUS_LABELS[s] }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="sub-start">Début</Label>
          <Input id="sub-start" v-model="startedAt" type="date" />
        </div>
        <div class="space-y-2">
          <Label for="sub-end">Expiration</Label>
          <Input id="sub-end" v-model="endsAt" type="date" />
        </div>
        <div class="space-y-2">
          <Label for="sub-trial">Fin essai</Label>
          <Input id="sub-trial" v-model="trialEndsAt" type="date" />
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="isTrial" type="checkbox" class="rounded border-border" />
          En période d'essai
        </label>

        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">Annuler</Button>
          <Button
            type="submit"
            class="bg-primary-600 text-white hover:bg-primary-800"
            :disabled="loading"
          >
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
