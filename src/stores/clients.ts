import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import { fetchClients as fetchClientsRequest } from '@/services/clients.service'
import type { PaginationMeta } from '@/types/api'
import type { Client } from '@/types'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const search = ref('')
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchClientsRequest({
        page: page.value,
        search: search.value.trim() || undefined,
      })
      if (!response.success) {
        throw new Error(response.message)
      }
      clients.value = response.data
      pagination.value = response.pagination
    } catch (e) {
      error.value = getApiErrorMessage(e)
      clients.value = []
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

  return {
    clients,
    pagination,
    search,
    page,
    loading,
    error,
    load,
    setPage,
    setSearch,
  }
})
