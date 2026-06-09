import { ref } from 'vue'
import { defineStore } from 'pinia'
export interface SalonState {
  id: string
  name: string
  slug: string
  phone?: string
  booking_link?: string
  logo_url?: string | null
}

export const useSalonStore = defineStore('salon', () => {
  const salon = ref<SalonState | null>(null)
  const loading = ref(false)

  function setSalon(data: SalonState | null) {
    salon.value = data
  }

  return { salon, loading, setSalon }
})
