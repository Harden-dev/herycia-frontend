<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminMetricCard from '@/components/admin/AdminMetricCard.vue'
import AdminRecentPaymentsTable from '@/components/admin/AdminRecentPaymentsTable.vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import SimpleBarChart from '@/components/dashboard/SimpleBarChart.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { adminOverviewMetrics, citiesToBarChart } from '@/lib/admin'
import { fetchAdminOverview, fetchSalonsByCity } from '@/services/admin.service'
import type { AdminOverviewStats, SalonsByCityStats } from '@/types/admin'

const overview = ref<AdminOverviewStats | null>(null)
const cities = ref<SalonsByCityStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const metrics = computed(() => (overview.value ? adminOverviewMetrics(overview.value) : []))
const cityChart = computed(() => (cities.value ? citiesToBarChart(cities.value) : []))

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [overviewRes, citiesRes] = await Promise.all([
      fetchAdminOverview(),
      fetchSalonsByCity(),
    ])
    if (!overviewRes.success) throw new Error(overviewRes.message)
    overview.value = overviewRes.data
    if (citiesRes.success) cities.value = citiesRes.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-8">
    <AdminHeader
      title="Dashboard"
      description="Vue globale de la plateforme Herycia"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <template v-if="loading">
        <Skeleton v-for="i in 6" :key="i" class="h-[120px] rounded-xl" />
      </template>
      <AdminMetricCard
        v-for="metric in metrics"
        v-else
        :key="metric.label"
        v-bind="metric"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <DashboardPanel
        title="Répartition par ville"
        description="Nombre de salons inscrits par ville"
      >
        <template v-if="loading">
          <Skeleton class="h-48 w-full rounded-lg" />
        </template>
        <SimpleBarChart
          v-else-if="cityChart.length"
          :data="cityChart"
          bar-class="bg-primary-500"
        />
        <p v-else class="py-12 text-center text-sm text-muted-foreground">
          Aucune donnée disponible
        </p>
      </DashboardPanel>

      <DashboardPanel
        title="Derniers paiements SaaS"
        description="5 derniers encaissements d'abonnement"
      >
        <AdminRecentPaymentsTable
          :payments="overview?.recent_payments ?? []"
          :loading="loading"
        />
      </DashboardPanel>
    </div>
  </div>
</template>
