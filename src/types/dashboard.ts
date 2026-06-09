export interface DashboardMetric {
  value: number
  trend: number | null
  trend_percent: number | null
}

export interface ChartPoint {
  label: string
  value: number
}

export interface DashboardOverview {
  appointments_today: DashboardMetric
  revenue_today: DashboardMetric
  active_clients: DashboardMetric
  queue_waiting: DashboardMetric
}

export interface ClientsStats {
  period: 'month' | 'year'
  points: ChartPoint[]
  total: number
  trend_percent: number | null
}

export interface RevenueStats {
  period: 'day' | 'week' | 'month' | 'year'
  points: ChartPoint[]
  total: number
  trend_percent: number | null
}

export type ActivityType = 'appointment' | 'payment' | 'client' | 'queue' | 'system'

export interface ActivityLog {
  id: string
  type: ActivityType
  message: string
  created_at: string
}

export interface QueueDashboardEntry {
  id: string
  position: number
  client_name: string
  service_name: string
  wait_minutes: number
  status: 'waiting' | 'called'
}
