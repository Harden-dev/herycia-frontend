<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconScissors } from '@tabler/icons-vue'
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
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useServicesStore } from '@/stores/services'
import type { SalonService } from '@/types'

const open = defineModel<boolean>('open', { default: false })
const service = defineModel<SalonService | null>('service', { default: null })

const store = useServicesStore()
const name = ref('')
const durationMin = ref('')
const price = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

const canSubmit = computed(() => {
  const duration = Number(durationMin.value)
  const amount = Number(price.value)
  return (
    service.value &&
    name.value.trim().length > 0 &&
    Number.isFinite(duration) &&
    duration > 0 &&
    Number.isFinite(amount) &&
    amount >= 0
  )
})

function fillFromService(s: SalonService) {
  name.value = s.name
  durationMin.value = String(s.duration_min)
  price.value = String(s.price)
  formError.value = null
}

watch(
  () => [open.value, service.value] as const,
  ([isOpen, s]) => {
    if (isOpen && s) fillFromService(s)
    if (!isOpen) {
      service.value = null
      formError.value = null
    }
  },
)

async function onSubmit() {
  if (!canSubmit.value || !service.value || submitting.value) return
  submitting.value = true
  formError.value = null
  try {
    await store.update(service.value.id, {
      name: name.value.trim(),
      duration_min: Number(durationMin.value),
      price: Number(price.value),
    })
    toast.success('Prestation modifiée avec succès')
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
      class="gap-0 overflow-hidden border-primary-200/60 p-0 sm:max-w-[440px]"
      :show-close-button="!submitting"
    >
      <div class="border-b border-border bg-gradient-to-br from-primary-50 to-card px-6 py-5">
        <DialogHeader class="space-y-3 text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-[0_4px_14px_rgb(15_110_86_/_0.25)]"
            >
              <IconScissors :size="22" :stroke-width="2" />
            </div>
            <div>
              <DialogTitle class="text-lg font-medium text-foreground">
                Modifier la prestation
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                Mettre à jour le nom, la durée ou le tarif.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      <form class="space-y-4 px-6 py-5" @submit.prevent="onSubmit">
        <p
          v-if="formError"
          class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800"
        >
          {{ formError }}
        </p>

        <div class="space-y-2">
          <Label for="edit-service-name">Nom</Label>
          <Input
            id="edit-service-name"
            v-model="name"
            placeholder="Ex. Coupe homme"
            class="h-10 rounded-lg border-border bg-card"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="edit-service-duration">Durée (min)</Label>
            <Input
              id="edit-service-duration"
              v-model="durationMin"
              type="number"
              min="1"
              step="1"
              class="h-10 rounded-lg border-border bg-card"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-service-price">Prix (F CFA)</Label>
            <Input
              id="edit-service-price"
              v-model="price"
              type="number"
              min="0"
              step="1"
              class="h-10 rounded-lg border-border bg-card"
              required
            />
          </div>
        </div>

        <DialogFooter class="border-t border-border bg-secondary/30 px-0 pb-0 pt-4 sm:justify-between">
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
            {{ submitting ? 'Enregistrement…' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
