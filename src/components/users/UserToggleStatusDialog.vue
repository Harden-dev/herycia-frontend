<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconUserCheck, IconUserOff, IconUsers } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useUsersStore } from '@/stores/users'
import type { StaffMember } from '@/types'

const open = defineModel<boolean>('open', { default: false })
const user = defineModel<StaffMember | null>('user', { default: null })

const store = useUsersStore()
const submitting = ref(false)
const formError = ref<string | null>(null)

const isDeactivating = computed(() => user.value?.is_active ?? true)

watch(open, (isOpen) => {
  if (!isOpen) {
    user.value = null
    formError.value = null
  }
})

async function onConfirm() {
  if (!user.value || submitting.value) return
  submitting.value = true
  formError.value = null
  const wasActive = user.value.is_active
  try {
    await store.toggleStatus(user.value.id)
    toast.success(
      wasActive ? 'Membre désactivé avec succès' : 'Membre réactivé avec succès',
    )
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
      class="gap-0 overflow-hidden p-0 sm:max-w-[420px]"
      :class="isDeactivating ? 'border-danger-200/60' : 'border-success-200/60'"
      :show-close-button="!submitting"
    >
      <div
        class="border-b border-border px-6 py-5"
        :class="
          isDeactivating
            ? 'bg-gradient-to-br from-danger-50 to-card'
            : 'bg-gradient-to-br from-success-50 to-card'
        "
      >
        <DialogHeader class="space-y-3 text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
              :class="isDeactivating ? 'bg-danger-600' : 'bg-success-600'"
            >
              <IconUsers :size="22" :stroke-width="2" />
            </div>
            <div>
              <DialogTitle class="text-lg font-medium text-foreground">
                {{ isDeactivating ? 'Désactiver le membre' : 'Réactiver le membre' }}
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                {{
                  isDeactivating
                    ? 'Le compte ne pourra plus se connecter au backoffice.'
                    : 'Le compte retrouvera l\'accès au backoffice.'
                }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      <div class="space-y-4 px-6 py-5">
        <p v-if="formError" class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800">
          {{ formError }}
        </p>
        <p v-if="user" class="text-sm text-foreground">
          Confirmer
          {{ isDeactivating ? 'la désactivation' : 'la réactivation' }}
          de
          <span class="font-medium">{{ user.name }}</span>
          ({{ user.email ?? user.phone }}) ?
        </p>

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
            type="button"
            class="gap-2 text-white"
            :class="isDeactivating ? 'bg-danger-600 hover:bg-danger-800' : 'bg-success-600 hover:bg-success-800'"
            :disabled="submitting"
            @click="onConfirm"
          >
            <IconUserOff v-if="isDeactivating" :size="16" />
            <IconUserCheck v-else :size="16" />
            {{
              submitting
                ? 'En cours…'
                : isDeactivating
                  ? 'Désactiver'
                  : 'Réactiver'
            }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
