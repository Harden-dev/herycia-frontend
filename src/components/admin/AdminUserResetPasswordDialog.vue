<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { resetAdminUserPassword } from '@/services/admin.service'
import type { AdminPlatformUser } from '@/types/admin'

const open = defineModel<boolean>('open', { default: false })
const user = defineModel<AdminPlatformUser | null>('user', { default: null })

const customPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const generatedPassword = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) {
    customPassword.value = ''
    generatedPassword.value = null
    error.value = null
  }
})

async function onAutoGenerate() {
  if (!user.value) return
  loading.value = true
  error.value = null
  generatedPassword.value = null
  try {
    const response = await resetAdminUserPassword(user.value.id)
    if (!response.success) throw new Error(response.message)
    generatedPassword.value = response.data.generated_password ?? null
    toast.success(response.message)
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function onSetPassword() {
  if (!user.value || !customPassword.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const response = await resetAdminUserPassword(user.value.id, customPassword.value.trim())
    if (!response.success) throw new Error(response.message)
    toast.success(response.message)
    open.value = false
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function copyPassword() {
  if (!generatedPassword.value) return
  await navigator.clipboard.writeText(generatedPassword.value)
  toast.success('Mot de passe copié')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogDescription v-if="user">
          {{ user.name }} — {{ user.phone }}
        </DialogDescription>
      </DialogHeader>

      <p v-if="error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
        {{ error }}
      </p>

      <div
        v-if="generatedPassword"
        class="rounded-lg border border-primary-200 bg-primary-50 p-4"
      >
        <p class="text-xs font-medium text-primary-800">Mot de passe généré (affiché une fois)</p>
        <p class="mt-2 font-mono text-lg font-semibold text-primary-900">
          {{ generatedPassword }}
        </p>
        <Button variant="outline" size="sm" class="mt-3" @click="copyPassword">
          Copier
        </Button>
      </div>

      <div v-else class="space-y-4">
        <Button
          class="w-full bg-primary-600 text-white hover:bg-primary-800"
          :disabled="loading"
          @click="onAutoGenerate"
        >
          {{ loading ? 'Génération...' : 'Générer automatiquement' }}
        </Button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="custom-pwd">Mot de passe imposé</Label>
          <Input id="custom-pwd" v-model="customPassword" type="password" />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="open = false">
          {{ generatedPassword ? 'Fermer' : 'Annuler' }}
        </Button>
        <Button
          v-if="!generatedPassword"
          type="button"
          class="bg-primary-600 text-white hover:bg-primary-800"
          :disabled="loading || !customPassword.trim()"
          @click="onSetPassword"
        >
          Appliquer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
