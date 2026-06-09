<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import type { QueueEntry } from '@/types'

defineProps<{
  entry: QueueEntry
}>()

const emit = defineEmits<{
  call: [id: string]
  done: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <div class="rounded-lg border border-border bg-card p-4">
    <div class="flex items-center gap-3">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-50 text-sm font-medium text-warning-800"
      >
        {{ entry.position }}
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium">{{ entry.client.name }}</p>
        <p class="text-xs text-muted-foreground">
          {{ entry.service.name }} · ~{{ entry.wait_minutes }} min d'attente
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
        <Button v-if="entry.status === 'waiting'" size="sm" @click="emit('call', entry.id)">
          Appeler
        </Button>
        <Button
          v-if="entry.status === 'called'"
          size="sm"
          variant="outline"
          @click="emit('done', entry.id)"
        >
          Terminé
        </Button>
        <Button size="sm" variant="ghost" @click="emit('remove', entry.id)">
          <IconX :size="14" :stroke-width="1.5" />
        </Button>
      </div>
    </div>
  </div>
</template>
