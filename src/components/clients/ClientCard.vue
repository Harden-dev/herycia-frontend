<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Client } from '@/types'
import { formatPhone, initials } from '@/lib/utils'

defineProps<{
  client: Client
}>()

const emit = defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <div
    class="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-primary-400"
    @click="emit('click', client.id)"
  >
    <div class="flex items-center gap-3">
      <Avatar class="h-9 w-9">
        <AvatarFallback class="bg-primary-50 text-xs font-medium text-primary-800">
          {{ initials(client.name) }}
        </AvatarFallback>
      </Avatar>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-foreground">{{ client.name }}</p>
        <p class="font-mono text-xs text-muted-foreground">{{ formatPhone(client.phone) }}</p>
      </div>
    </div>
  </div>
</template>
