import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import { dmyToIso, todayDMY } from '@/lib/utils'
import {
  cancelAppointment,
  fetchAppointments,
  updateAppointmentStatus,
  type AppointmentsQuery,
} from '@/services/appointments.service'
import type { AppointmentListItem, AppointmentStatus } from '@/types'

export const useAppointmentsStore = defineStore('appointments', () => {
  const items = ref<AppointmentListItem[]>([])
  const date = ref(todayDMY())
  const userId = ref<string | undefined>()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(query: Partial<AppointmentsQuery> = {}) {
    loading.value = true
    error.value = null
    try {
      const dateParam = query.date ?? date.value
      const response = await fetchAppointments({
        date: dmyToIso(dateParam),
        user_id: query.user_id ?? userId.value,
      })
      if (!response.success) throw new Error(response.message)
      items.value = response.data
    } catch (e) {
      error.value = getApiErrorMessage(e)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function setDate(newDate: string) {
    date.value = newDate
    return load({ date: newDate })
  }

  function setStylist(id: string | undefined) {
    userId.value = id
    return load()
  }

  async function setStatus(id: string, status: AppointmentStatus) {
    await updateAppointmentStatus(id, status)
    return load()
  }

  async function cancel(id: string) {
    await cancelAppointment(id)
    return load()
  }

  return {
    items,
    date,
    userId,
    loading,
    error,
    load,
    setDate,
    setStylist,
    setStatus,
    cancel,
  }
})
