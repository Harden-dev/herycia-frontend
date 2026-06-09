<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
} from '@tabler/icons-vue'
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
import { getApiErrorMessage } from '@/lib/api'
import { STAFF_ROLE_OPTIONS } from '@/lib/permissions'
import { toast } from '@/lib/toast'
import { useUsersStore } from '@/stores/users'
import type { SalonStaffRole } from '@/types'

const open = defineModel<boolean>('open', { default: false })

const store = useUsersStore()
const name = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const role = ref<SalonStaffRole>('stylist')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

const passwordsMatch = computed(
  () => password.value.length > 0 && password.value === passwordConfirmation.value,
)

const canSubmit = computed(
  () =>
    name.value.trim() &&
    phone.value.trim() &&
    email.value.trim() &&
    password.value.length >= 8 &&
    passwordsMatch.value &&
    role.value,
)

function resetForm() {
  name.value = ''
  phone.value = ''
  email.value = ''
  password.value = ''
  passwordConfirmation.value = ''
  role.value = 'stylist'
  showPassword.value = false
  showPasswordConfirm.value = false
  formError.value = null
}

watch(open, (isOpen) => {
  if (!isOpen) resetForm()
})

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return
  if (!passwordsMatch.value) {
    formError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  submitting.value = true
  formError.value = null
  try {
    await store.create({
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      role: role.value,
    })
    toast.success('Membre ajouté à l\'équipe')
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
      class="max-h-[min(90vh,720px)] gap-0 overflow-hidden border-primary-200/60 p-0 sm:max-w-[480px]"
      :show-close-button="!submitting"
    >
      <div class="border-b border-border bg-gradient-to-br from-primary-50 to-card px-6 py-5">
        <DialogHeader class="space-y-3 text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-[0_4px_14px_rgb(15_110_86_/_0.25)]"
            >
              <IconUsers :size="22" :stroke-width="2" />
            </div>
            <div>
              <DialogTitle class="text-lg font-medium text-foreground">
                Nouveau membre
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                Compte staff avec rôle et accès au backoffice.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      <form class="max-h-[50vh] space-y-4 overflow-y-auto px-6 py-5" @submit.prevent="onSubmit">
        <p
          v-if="formError"
          class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800"
        >
          {{ formError }}
        </p>

        <div class="space-y-2">
          <Label for="member-name">Nom complet</Label>
          <div class="relative">
            <IconUser
              :size="18"
              :stroke-width="2"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="member-name"
              v-model="name"
              placeholder="Awa Traoré"
              class="h-10 rounded-lg border-border bg-card pl-10"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="member-phone">Téléphone</Label>
            <div class="relative">
              <IconPhone
                :size="18"
                :stroke-width="2"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="member-phone"
                v-model="phone"
                type="tel"
                placeholder="2250708223344"
                class="h-10 rounded-lg border-border bg-card pl-10 font-mono text-sm"
                required
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="member-role">Rôle</Label>
            <Select v-model="role">
              <SelectTrigger id="member-role" class="h-10 w-full rounded-lg border-border bg-card">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="opt in STAFF_ROLE_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="member-email">Email</Label>
          <div class="relative">
            <IconMail
              :size="18"
              :stroke-width="2"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="member-email"
              v-model="email"
              type="email"
              placeholder="awa@salon-koffi.ci"
              class="h-10 rounded-lg border-border bg-card pl-10"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="member-password">Mot de passe</Label>
            <div class="relative">
              <Input
                id="member-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="8 caractères min."
                class="h-10 rounded-lg border-border bg-card pr-10"
                minlength="8"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <IconEyeOff v-if="showPassword" :size="18" :stroke-width="2" />
                <IconEye v-else :size="18" :stroke-width="2" />
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="member-password-confirm">Confirmation</Label>
            <div class="relative">
              <Input
                id="member-password-confirm"
                v-model="passwordConfirmation"
                :type="showPasswordConfirm ? 'text' : 'password'"
                placeholder="Répéter le mot de passe"
                class="h-10 rounded-lg border-border bg-card pr-10"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPasswordConfirm = !showPasswordConfirm"
              >
                <IconEyeOff v-if="showPasswordConfirm" :size="18" :stroke-width="2" />
                <IconEye v-else :size="18" :stroke-width="2" />
              </button>
            </div>
            <p
              v-if="passwordConfirmation && !passwordsMatch"
              class="text-xs text-danger-600"
            >
              Les mots de passe ne correspondent pas
            </p>
          </div>
        </div>

        <DialogFooter
          class="sticky bottom-0 border-t border-border bg-secondary/30 px-0 pb-0 pt-4 sm:justify-between"
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
            {{ submitting ? 'Création…' : 'Ajouter le membre' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
