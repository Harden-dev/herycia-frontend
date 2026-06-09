import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import { fetchAdminMe } from '@/services/admin.service'
import type { AdminProfile } from '@/types/admin'

export const useAdminStore = defineStore('admin', () => {
  const profile = ref<AdminProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadProfile() {
    if (profile.value) return profile.value
    loading.value = true
    error.value = null
    try {
      const response = await fetchAdminMe()
      if (!response.success) throw new Error(response.message)
      profile.value = response.data
      return response.data
    } catch (e) {
      error.value = getApiErrorMessage(e)
      return null
    } finally {
      loading.value = false
    }
  }

  function setProfile(data: AdminProfile) {
    profile.value = data
  }

  function clearProfile() {
    profile.value = null
  }

  return { profile, loading, error, loadProfile, setProfile, clearProfile }
})
