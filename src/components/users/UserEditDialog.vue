<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconMail, IconPhone, IconUser, IconUsers } from '@tabler/icons-vue'
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
import type { SalonStaffRole, StaffMember } from '@/types'

const open = defineModel<boolean>('open', { default: false })
const user = defineModel<StaffMember | null>('user', { default: null })

const store = useUsersStore()
const name = ref('')
const phone = ref('')
const email = ref('')
const role = ref<SalonStaffRole>('stylist')
const submitting = ref(false)
const formError = ref<string | null>(null)

const canSubmit = computed(
  () =>
    user.value &&
    name.value.trim() &&
    phone.value.trim() &&
    email.value.trim() &&
    role.value,
)

function fillFromUser(u: StaffMember) {
  name.value = u.name
  phone.value = u.phone
  email.value = u.email ?? ''
  role.value = u.role
  formError.value = null
}

watch(
  () => [open.value, user.value] as const,
  ([isOpen, u]) => {
    if (isOpen && u) fillFromUser(u)
    if (!isOpen) {
      user.value = null
      formError.value = null
    }
  },
)

async function onSubmit() {
  if (!canSubmit.value || !user.value || submitting.value) return
  submitting.value = true
  formError.value = null
  try {
    await store.update(user.value.id, {
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      role: role.value,
    })
    toast.success('Membre modifié avec succès')
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
      class="gap-0 overflow-hidden border-primary-200/60 p-0 sm:max-w-[480px]"
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
                Modifier le membre
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                Mettre à jour les informations ou le rôle.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      <form class="space-y-4 px-6 py-5" @submit.prevent="onSubmit">
        <p v-if="formError" class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800">
          {{ formError }}
        </p>

        <div class="space-y-2">
          <Label for="edit-member-name">Nom complet</Label>
          <div class="relative">
            <IconUser
              :size="18"
              :stroke-width="2"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="edit-member-name"
              v-model="name"
              class="h-10 rounded-lg border-border bg-card pl-10"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="edit-member-phone">Téléphone</Label>
            <div class="relative">
              <IconPhone
                :size="18"
                :stroke-width="2"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="edit-member-phone"
                v-model="phone"
                type="tel"
                class="h-10 rounded-lg border-border bg-card pl-10 font-mono text-sm"
                required
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="edit-member-role">Rôle</Label>
            <Select v-model="role">
              <SelectTrigger
                id="edit-member-role"
                class="h-10 w-full rounded-lg border-border bg-card"
              >
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
          <Label for="edit-member-email">Email</Label>
          <div class="relative">
            <IconMail
              :size="18"
              :stroke-width="2"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="edit-member-email"
              v-model="email"
              type="email"
              class="h-10 rounded-lg border-border bg-card pl-10"
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
