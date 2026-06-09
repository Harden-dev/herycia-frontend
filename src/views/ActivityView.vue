<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ActivityTimeline from '@/components/activity/ActivityTimeline.vue'
import { getApiErrorMessage } from '@/lib/api'
import { fetchDashboardActivity } from '@/services/dashboard.service'
import type { ActivityLog } from '@/types/dashboard'

const logs = ref<ActivityLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetchDashboardActivity(50)
    if (!response.success) throw new Error(response.message)
    logs.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
    logs.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-8">
    <AppHeader
      title="Activité"
      :description="`${logs.length} événement(s) récent(s)`"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="overflow-hidden rounded-xl border border-border bg-card px-5 py-2">
      <ActivityTimeline
        :logs="logs"
        :loading="loading"
        show-type
        show-absolute-time
        :skeleton-count="8"
      />
    </div>
  </div>
</template>
