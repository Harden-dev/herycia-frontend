import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import { createUser, fetchUsers, toggleUserStatus, updateUser } from '@/services/users.service'
import type { PaginationMeta } from '@/types/api'
import type { CreateUserPayload, StaffMember, UpdateUserPayload } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const items = ref<StaffMember[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const search = ref('')
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchUsers({
        page: page.value,
        search: search.value.trim() || undefined,
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

  async function create(payload: CreateUserPayload) {
    const response = await createUser(payload)
    if (!response.success) throw new Error(response.message)
    page.value = 1
    await load()
    return response.data
  }

  async function update(id: string, payload: UpdateUserPayload) {
    const response = await updateUser(id, payload)
    if (!response.success) throw new Error(response.message)
    await load()
    return response.data
  }

  async function toggleStatus(id: string) {
    const response = await toggleUserStatus(id)
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
    create,
    update,
    toggleStatus,
  }
})
