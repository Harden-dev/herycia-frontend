<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSalonStore } from '@/stores/salon'
import { useSubscriptionStore } from '@/stores/subscription'
import AppHeader from '@/components/layout/AppHeader.vue'
import ActivityLogsCard from '@/components/dashboard/ActivityLogsCard.vue'
import ClientsEvolutionCard from '@/components/dashboard/ClientsEvolutionCard.vue'
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard.vue'
import RevenueEvolutionCard from '@/components/dashboard/RevenueEvolutionCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { overviewMetricCards } from '@/lib/dashboard'
import { fetchDashboardActivity, fetchDashboardOverview } from '@/services/dashboard.service'
import type { ActivityLog, DashboardOverview } from '@/types/dashboard'

const ACTIVITY_LIMIT = 5

const salonStore = useSalonStore()
const subscriptionStore = useSubscriptionStore()
const hasPremium = computed(() => subscriptionStore.canUseAnalytics)
const premiumCtaLabel = computed(() =>
  subscriptionStore.isActiveBasic ? 'Passer Premium' : 'Découvrir Premium',
)
const overview = ref<DashboardOverview | null>(null)
const activity = ref<ActivityLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const greeting = computed(() => {
  const name = salonStore.salon?.name
  return name ? `Vue d'ensemble — ${name}` : "Vue d'ensemble de votre salon"
})

const metrics = computed(() => (overview.value ? overviewMetricCards(overview.value) : []))

onMounted(async () => {
  loading.value = true
  error.value = null
  if (!subscriptionStore.subscription) await subscriptionStore.load()
  const today = new Date().toISOString().slice(0, 10)
  try {
    const overviewRes = await fetchDashboardOverview(today)
    if (!overviewRes.success) throw new Error(overviewRes.message)
    overview.value = overviewRes.data

    if (subscriptionStore.canUseAnalytics) {
      const activityRes = await fetchDashboardActivity(ACTIVITY_LIMIT)
      if (activityRes.success) activity.value = activityRes.data
    }
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-8">
    <AppHeader title="Dashboard" :description="greeting" />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="loading">
        <Skeleton v-for="i in 4" :key="i" class="h-[120px] rounded-xl" />
      </template>
      <DashboardMetricCard v-for="metric in metrics" v-else :key="metric.label" v-bind="metric" />
    </div>

    <template v-if="hasPremium">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ClientsEvolutionCard />
        <RevenueEvolutionCard />
      </div>
      <ActivityLogsCard :logs="activity" :loading="loading" :limit="ACTIVITY_LIMIT" />
    </template>

    <div
      v-else
      class="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 px-6 py-8 text-center"
    >
      <p class="text-sm font-medium text-primary-900">Analytiques Premium</p>
      <p class="mt-1 text-xs text-muted-foreground">
        Stats clients, recettes et historique d'activité — disponibles avec le plan Premium.
      </p>
      <button
        type="button"
        class="mt-4 text-sm font-medium text-primary-700 underline-offset-2 hover:underline"
        @click="subscriptionStore.openUpgradeModal()"
      >
        {{ premiumCtaLabel }}
      </button>
    </div>
  </div>
</template>
