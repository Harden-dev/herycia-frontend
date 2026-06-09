<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import {
  ACTIVITY_TYPE_LABELS,
  activityIconByType,
  activityStyleByType,
} from '@/lib/activity'
import { formatRelativeTime } from '@/lib/dashboard'
import { formatDateTimeShort } from '@/lib/utils'
import type { ActivityLog } from '@/types/dashboard'

withDefaults(
  defineProps<{
    logs: ActivityLog[]
    loading?: boolean
    showType?: boolean
    showAbsoluteTime?: boolean
    skeletonCount?: number
  }>(),
  {
    skeletonCount: 5,
    showType: false,
    showAbsoluteTime: false,
  },
)
</script>

<template>
  <div v-if="loading" class="flex flex-col gap-3">
    <Skeleton v-for="i in skeletonCount" :key="i" class="h-14 rounded-lg" />
  </div>
  <p
    v-else-if="!logs.length"
    class="py-12 text-center text-sm text-muted-foreground"
  >
    Aucune activité
  </p>
  <div v-else class="relative flex flex-col gap-0">
    <div class="absolute bottom-2 left-4 top-2 w-px bg-border" aria-hidden="true" />

    <div
      v-for="log in logs"
      :key="log.id"
      class="relative flex gap-3 border-b border-border/60 py-4 last:border-b-0"
    >
      <div
        class="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-card"
        :class="activityStyleByType[log.type]"
      >
        <component :is="activityIconByType[log.type]" :size="15" :stroke-width="2" />
      </div>
      <div class="min-w-0 flex-1 pt-0.5">
        <div v-if="showType" class="mb-1">
          <span
            class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
            :class="activityStyleByType[log.type]"
          >
            {{ ACTIVITY_TYPE_LABELS[log.type] }}
          </span>
        </div>
        <p class="text-sm leading-snug text-foreground">{{ log.message }}</p>
        <p class="mt-1 text-[11px] text-muted-foreground">
          <template v-if="showAbsoluteTime">
            {{ formatDateTimeShort(log.created_at) }}
            <span class="text-muted-foreground/70"> · {{ formatRelativeTime(log.created_at) }}</span>
          </template>
          <template v-else>
            {{ formatRelativeTime(log.created_at) }}
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
