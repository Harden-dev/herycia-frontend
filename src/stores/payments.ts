import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import { createPayment, fetchPayments, fetchPaymentsSummary } from '@/services/payments.service'
import type { PaginationMeta } from '@/types/api'
import type { CreatePaymentPayload, PaymentListItem, PaymentSummary } from '@/types'

export const usePaymentsStore = defineStore('payments', () => {
  const items = ref<PaymentListItem[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const summary = ref<PaymentSummary | null>(null)
  const page = ref(1)
  const loading = ref(false)
  const summaryLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadSummary() {
    summaryLoading.value = true
    try {
      const response = await fetchPaymentsSummary()
      if (!response.success) throw new Error(response.message)
      summary.value = response.data
    } catch {
      summary.value = null
    } finally {
      summaryLoading.value = false
    }
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchPayments({ page: page.value })
      if (!response.success) throw new Error(response.message)
      items.value = response.data
      pagination.value = response.pagination
    } catch (e) {
      error.value = getApiErrorMessage(e)
      items.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  function setPage(newPage: number) {
    page.value = newPage
    return load()
  }

  async function create(payload: CreatePaymentPayload) {
    const response = await createPayment(payload)
    if (!response.success) throw new Error(response.message)
    page.value = 1
    await Promise.all([load(), loadSummary()])
    return response.data
  }

  return {
    items,
    pagination,
    summary,
    page,
    loading,
    summaryLoading,
    error,
    load,
    loadSummary,
    setPage,
    create,
  }
})
