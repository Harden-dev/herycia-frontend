import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { QueueEntry } from '@/types'

export const useQueueStore = defineStore('queue', () => {
  const entries = ref<QueueEntry[]>([])
  const loading = ref(false)

  function setEntries(data: QueueEntry[]) {
    entries.value = data
  }

  return { entries, loading, setEntries }
})
