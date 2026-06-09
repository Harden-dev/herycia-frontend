import { ref } from 'vue'

export type ToastVariant = 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

function push(message: string, variant: ToastVariant, durationMs = 4000) {
  const item: ToastItem = { id: ++nextId, message, variant }
  toasts.value = [...toasts.value, item]
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== item.id)
  }, durationMs)
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export const toast = {
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
}

export function useToasts() {
  return toasts
}
