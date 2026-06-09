import type { DashboardMetric } from '@/types/dashboard'
import { formatCFA } from '@/lib/utils'

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days} j`
}

export function metricTrendBadge(metric: DashboardMetric): {
  trend: 'up' | 'down'
  trendValue: string
} | null {
  if (metric.trend_percent != null && metric.trend_percent !== 0) {
    return {
      trend: metric.trend_percent > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(metric.trend_percent)}%`,
    }
  }
  if (metric.trend != null && metric.trend !== 0) {
    return {
      trend: metric.trend > 0 ? 'up' : 'down',
      trendValue: String(Math.abs(metric.trend)),
    }
  }
  return null
}

export function formatRevenueAxis(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`
  if (n >= 1000) return `${Math.round(n / 1000)}k F`
  return `${n} F`
}

export function overviewMetricCards(overview: import('@/types/dashboard').DashboardOverview) {
  const appt = overview.appointments_today
  const rev = overview.revenue_today
  const clients = overview.active_clients
  const queue = overview.queue_waiting

  return [
    {
      label: "RDV aujourd'hui",
      value: String(appt.value),
      iconKey: 'calendar' as const,
      accent: 'primary' as const,
      ...metricTrendBadge(appt),
    },
    {
      label: "Recettes aujourd'hui",
      value: formatCFA(rev.value),
      iconKey: 'cash' as const,
      accent: 'success' as const,
      ...metricTrendBadge(rev),
    },
    {
      label: 'Clients actifs',
      value: String(clients.value),
      iconKey: 'userCheck' as const,
      accent: 'accent' as const,
      ...metricTrendBadge(clients),
    },
    {
      label: "File d'attente",
      value: String(queue.value),
      iconKey: 'users' as const,
      accent: 'warning' as const,
      ...metricTrendBadge(queue),
    },
  ]
}
