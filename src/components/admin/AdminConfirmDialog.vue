<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  destructive?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" @click="open = false">Annuler</Button>
        <Button
          type="button"
          :class="destructive ? 'bg-danger-600 text-white hover:bg-danger-800' : 'bg-primary-600 text-white hover:bg-primary-800'"
          :disabled="loading"
          @click="emit('confirm')"
        >
          {{ loading ? 'Traitement...' : (confirmLabel ?? 'Confirmer') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
