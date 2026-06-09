<script setup lang="ts">
import { ref, watch } from 'vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import SimpleBarChart from '@/components/dashboard/SimpleBarChart.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApiErrorMessage } from '@/lib/api'
import { formatRevenueAxis } from '@/lib/dashboard'
import { formatCFA } from '@/lib/utils'
import { fetchRevenueStats } from '@/services/dashboard.service'
import type { RevenueStats } from '@/types/dashboard'

const period = ref<'day' | 'week' | 'month' | 'year'>('week')
const stats = ref<RevenueStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const barClass: Record<string, string> = {
  day: 'bg-primary-400',
  week: 'bg-primary-600',
  month: 'bg-primary-600',
  year: 'bg-primary-800',
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchRevenueStats(period.value)
    if (!response.success) throw new Error(response.message)
    stats.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
    stats.value = null
  } finally {
    loading.value = false
  }
}

watch(period, load, { immediate: true })
</script>

<template>
  <Tabs v-model="period" class="flex flex-col">
    <DashboardPanel title="Évolution des recettes" description="Chiffre d'affaires encaissé">
      <template #actions>
        <TabsList class="h-8 rounded-lg bg-secondary p-0.5">
          <TabsTrigger
            value="day"
            class="rounded-md px-2.5 py-1 text-[11px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Jour
          </TabsTrigger>
          <TabsTrigger
            value="week"
            class="rounded-md px-2.5 py-1 text-[11px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Semaine
          </TabsTrigger>
          <TabsTrigger
            value="month"
            class="rounded-md px-2.5 py-1 text-[11px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Mois
          </TabsTrigger>
          <TabsTrigger
            value="year"
            class="rounded-md px-2.5 py-1 text-[11px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Année
          </TabsTrigger>
        </TabsList>
      </template>

      <p v-if="error" class="mb-3 text-sm text-danger-600">{{ error }}</p>

      <TabsContent :value="period" class="mt-0">
        <Skeleton v-if="loading" class="h-48 w-full rounded-lg" />
        <SimpleBarChart
          v-else-if="stats?.points.length"
          :data="stats.points"
          :format-value="formatRevenueAxis"
          :bar-class="barClass[period]"
        />
        <p v-else class="py-12 text-center text-sm text-muted-foreground">Aucune donnée</p>
      </TabsContent>

      <div
        v-if="stats && !loading"
        class="mt-4 flex items-center justify-between border-t border-border pt-4"
      >
        <div>
          <p class="text-xs text-muted-foreground">Total période</p>
          <p class="text-lg font-medium text-foreground">{{ formatCFA(stats.total) }}</p>
        </div>
        <span
          v-if="stats.trend_percent != null"
          class="rounded-full px-2.5 py-1 text-[11px] font-medium"
          :class="
            stats.trend_percent >= 0
              ? 'bg-success-50 text-success-800'
              : 'bg-danger-50 text-danger-800'
          "
        >
          {{ stats.trend_percent >= 0 ? '+' : '' }}{{ stats.trend_percent }}% vs période préc.
        </span>
      </div>
    </DashboardPanel>
  </Tabs>
</template>
