<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { IconArrowRight, IconClock } from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import type { QueueDashboardEntry } from '@/types/dashboard'
import { initials } from '@/lib/utils'

defineProps<{
  entries: QueueDashboardEntry[]
  loading?: boolean
  description?: string
}>()

function waitLabel(minutes: number) {
  return minutes < 30 ? 'text-warning-600' : 'text-danger-600'
}
</script>

<template>
  <DashboardPanel
    title="File d'attente"
    :description="description ?? 'Clients en attente'"
    class="flex h-full flex-col"
  >
    <template #actions>
      <Button variant="ghost" size="sm" class="text-primary-600" as-child>
        <RouterLink to="/queue" class="inline-flex items-center gap-1 text-xs">
          Voir tout
          <IconArrowRight :size="14" :stroke-width="2" />
        </RouterLink>
      </Button>
    </template>

    <div v-if="loading" class="flex flex-col gap-2">
      <Skeleton v-for="i in 3" :key="i" class="h-14 rounded-lg" />
    </div>
    <p
      v-else-if="!entries.length"
      class="flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground"
    >
      Aucun client en file
    </p>
    <div v-else class="flex flex-1 flex-col gap-2">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 transition-colors hover:border-primary-200 hover:bg-card"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-50 text-sm font-medium text-warning-800"
        >
          {{ entry.position }}
        </div>
        <Avatar class="h-8 w-8">
          <AvatarFallback class="bg-primary-50 text-[10px] font-medium text-primary-800">
            {{ initials(entry.client_name) }}
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">{{ entry.client_name }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ entry.service_name }}</p>
        </div>
        <div
          class="flex shrink-0 items-center gap-1 text-xs"
          :class="waitLabel(entry.wait_minutes)"
        >
          <IconClock :size="13" :stroke-width="2" />
          <span class="font-medium">~{{ entry.wait_minutes }} min</span>
        </div>
      </div>
    </div>
  </DashboardPanel>
</template>
