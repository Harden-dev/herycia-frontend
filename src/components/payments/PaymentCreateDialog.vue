<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconCash } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/permissions'
import { toast } from '@/lib/toast'
import { formatCFA, formatDateTimeShort } from '@/lib/utils'
import { fetchAppointments } from '@/services/appointments.service'
import { usePaymentsStore } from '@/stores/payments'
import type { AppointmentListItem, PaymentMethod } from '@/types'

const open = defineModel<boolean>('open', { default: false })

const store = usePaymentsStore()
const appointments = ref<AppointmentListItem[]>([])
const appointmentsLoading = ref(false)
const appointmentId = ref('')
const method = ref<PaymentMethod>('cash')
const mobileMoneyRef = ref('')
const paidAt = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

const showMobileMoneyRef = computed(() => method.value === 'mobile_money')

const selectedAppointment = computed(() =>
  appointments.value.find((a) => a.id === appointmentId.value),
)

const paymentAmount = computed(() => selectedAppointment.value?.service.price ?? 0)

const canSubmit = computed(() => {
  const mobileOk = method.value !== 'mobile_money' || mobileMoneyRef.value.trim().length > 0
  return (
    appointmentId.value &&
    paymentAmount.value >= 1 &&
    method.value &&
    mobileOk
  )
})

function resetForm() {
  appointmentId.value = ''
  method.value = 'cash'
  mobileMoneyRef.value = ''
  paidAt.value = ''
  formError.value = null
}

async function loadAppointments() {
  appointmentsLoading.value = true
  try {
    const today = new Date().toISOString().slice(0, 10)
    const response = await fetchAppointments({ date: today })
    if (!response.success) throw new Error(response.message)
    appointments.value = response.data.filter((a) => a.status === 'completed')
  } catch (e) {
    appointments.value = []
    formError.value = getApiErrorMessage(e)
  } finally {
    appointmentsLoading.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm()
    void loadAppointments()
  }
})

watch(method, (m) => {
  if (m !== 'mobile_money') mobileMoneyRef.value = ''
})

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  formError.value = null
  try {
    const payload = {
      appointment_id: appointmentId.value,
      amount: paymentAmount.value,
      method: method.value,
      ...(paidAt.value ? { paid_at: paidAt.value } : {}),
      ...(method.value === 'mobile_money' ? { mobile_money_ref: mobileMoneyRef.value.trim() } : {}),
    }
    await store.create(payload)
    toast.success('Paiement enregistré avec succès')
    open.value = false
  } catch (e) {
    formError.value = getApiErrorMessage(e)
    toast.error(formError.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="max-h-[min(90vh,680px)] gap-0 overflow-hidden border-primary-200/60 p-0 sm:max-w-[480px]"
      :show-close-button="!submitting"
    >
      <div class="border-b border-border bg-gradient-to-br from-primary-50 to-card px-6 py-5">
        <DialogHeader class="space-y-3 text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-[0_4px_14px_rgb(15_110_86_/_0.25)]"
            >
              <IconCash :size="22" :stroke-width="2" />
            </div>
            <div>
              <DialogTitle class="text-lg font-medium text-foreground">
                Enregistrer un paiement
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                RDV terminés du jour uniquement.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      <form class="space-y-4 overflow-y-auto px-6 py-5" @submit.prevent="onSubmit">
        <p
          v-if="formError"
          class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800"
        >
          {{ formError }}
        </p>

        <div class="space-y-2">
          <Label for="payment-appointment">Rendez-vous</Label>
          <Skeleton v-if="appointmentsLoading" class="h-10 w-full rounded-lg" />
          <Select v-else v-model="appointmentId">
            <SelectTrigger
              id="payment-appointment"
              class="h-10 w-full rounded-lg border-border bg-card"
            >
              <SelectValue placeholder="Choisir un RDV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="appt in appointments" :key="appt.id" :value="appt.id">
                {{ appt.client.name }} — {{ appt.service.name }} ·
                {{ formatCFA(appt.service.price) }} ({{
                  formatDateTimeShort(appt.scheduled_at)
                }})
              </SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="!appointmentsLoading && appointments.length === 0"
            class="text-xs text-muted-foreground"
          >
            Aucun RDV terminé aujourd'hui.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="payment-amount">Montant</Label>
            <div
              id="payment-amount"
              class="flex h-10 items-center rounded-lg border border-border bg-secondary/50 px-3 text-sm font-medium text-foreground"
            >
              <span v-if="selectedAppointment">{{ formatCFA(paymentAmount) }}</span>
              <span v-else class="text-muted-foreground">Choisir un RDV</span>
            </div>
            <p v-if="selectedAppointment" class="text-[11px] text-muted-foreground">
              Tarif du service « {{ selectedAppointment.service.name }} »
            </p>
          </div>
          <div class="space-y-2">
            <Label for="payment-method">Méthode</Label>
            <Select v-model="method">
              <SelectTrigger
                id="payment-method"
                class="h-10 w-full rounded-lg border-border bg-card"
              >
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="opt in PAYMENT_METHOD_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div v-if="showMobileMoneyRef" class="space-y-2">
          <Label for="payment-mobile-ref">Référence Mobile Money</Label>
          <Input
            id="payment-mobile-ref"
            v-model="mobileMoneyRef"
            placeholder="Ex. TXN-2026-123456"
            class="h-10 rounded-lg border-border bg-card"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="payment-paid-at">
            Date de paiement
            <span class="font-normal text-muted-foreground">(optionnel)</span>
          </Label>
          <Input
            id="payment-paid-at"
            v-model="paidAt"
            type="date"
            class="h-10 rounded-lg border-border bg-card"
          />
        </div>

        <DialogFooter
          class="border-t border-border bg-secondary/30 px-0 pb-0 pt-4 sm:justify-between"
        >
          <Button
            type="button"
            variant="outline"
            class="border-border bg-card"
            :disabled="submitting"
            @click="open = false"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            class="bg-primary-600 text-white hover:bg-primary-800"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? 'Enregistrement…' : 'Enregistrer le paiement' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
