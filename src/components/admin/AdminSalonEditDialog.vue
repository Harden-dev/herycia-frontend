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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { extractValidationErrors, getApiErrorMessage } from '@/lib/api'
import { SALON_CITIES } from '@/lib/admin'
import { toast } from '@/lib/toast'
import { updateAdminSalon } from '@/services/admin.service'
import type { AdminSalonListItem, SalonCity } from '@/types/admin'

const open = defineModel<boolean>('open', { default: false })
const salon = defineModel<AdminSalonListItem | null>('salon', { default: null })

const emit = defineEmits<{ saved: [] }>()

const name = ref('')
const phone = ref('')
const whatsapp = ref('')
const city = ref<SalonCity | ''>('')
const address = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

watch(salon, (s) => {
  if (!s) return
  name.value = s.name
  phone.value = s.phone ?? ''
  whatsapp.value = s.whatsapp_number ?? ''
  city.value = (s.city as SalonCity) || ''
  address.value = ''
  error.value = null
  fieldErrors.value = {}
})

async function onSubmit() {
  if (!salon.value) return
  loading.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    const response = await updateAdminSalon(salon.value.id, {
      name: name.value.trim(),
      phone: phone.value.trim() || undefined,
      whatsapp_number: whatsapp.value.trim() || undefined,
      city: city.value || undefined,
      address: address.value.trim() || undefined,
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
        <DialogTitle>Modifier le salon</DialogTitle>
      </DialogHeader>

      <p v-if="error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
        {{ error }}
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="salon-name">Nom</Label>
          <Input id="salon-name" v-model="name" required />
          <p v-if="fieldErrors.name" class="text-xs text-danger-600">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="salon-city">Ville</Label>
          <Select v-model="city">
            <SelectTrigger id="salon-city">
              <SelectValue placeholder="Choisir une ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in SALON_CITIES" :key="c" :value="c">{{ c }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="salon-phone">Téléphone</Label>
          <Input id="salon-phone" v-model="phone" />
        </div>

        <div class="space-y-2">
          <Label for="salon-whatsapp">WhatsApp</Label>
          <Input id="salon-whatsapp" v-model="whatsapp" />
        </div>

        <div class="space-y-2">
          <Label for="salon-address">Adresse</Label>
          <Input id="salon-address" v-model="address" />
        </div>

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
