import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
  type ServicesQuery,
} from '@/services/prestations.service'
import type { PaginationMeta } from '@/types/api'
import type { CreateServicePayload, SalonService, UpdateServicePayload } from '@/types'

export const useServicesStore = defineStore('services', () => {
  const items = ref<SalonService[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const search = ref('')
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(query: Partial<ServicesQuery> = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await fetchServices({
        page: page.value,
        search: search.value.trim() || undefined,
        is_active: query.is_active,
      })
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

  function setSearch(query: string) {
    search.value = query
    page.value = 1
    return load()
  }

  async function deactivate(id: string) {
    await deleteService(id)
    return load()
  }

  async function create(payload: CreateServicePayload) {
    const response = await createService(payload)
    if (!response.success) throw new Error(response.message)
    page.value = 1
    await load()
    return response.data
  }

  async function update(id: string, payload: UpdateServicePayload) {
    const response = await updateService(id, payload)
    if (!response.success) throw new Error(response.message)
    await load()
    return response.data
  }

  return {
    items,
    pagination,
    search,
    page,
    loading,
    error,
    load,
    setPage,
    setSearch,
    deactivate,
    create,
    update,
  }
})
