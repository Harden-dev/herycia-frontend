<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { IconArrowRight } from '@tabler/icons-vue'
import ActivityTimeline from '@/components/activity/ActivityTimeline.vue'
import { Button } from '@/components/ui/button'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import type { ActivityLog } from '@/types/dashboard'

withDefaults(
  defineProps<{
    logs: ActivityLog[]
    loading?: boolean
    limit?: number
  }>(),
  { limit: 12 },
)
</script>

<template>
  <DashboardPanel
    title="Activité récente"
    :description="`${limit} dernières actions`"
    class="flex h-full flex-col"
  >
    <template #actions>
      <Button variant="ghost" size="sm" class="text-primary-600" as-child>
        <RouterLink to="/activity" class="inline-flex items-center gap-1 text-xs">
          Voir tout
          <IconArrowRight :size="14" :stroke-width="2" />
        </RouterLink>
      </Button>
    </template>

    <ActivityTimeline :logs="logs" :loading="loading" />
  </DashboardPanel>
</template>
