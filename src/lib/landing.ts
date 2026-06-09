import { ref, type Ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

/** Stroke Tabler icons — landing page (plus visible) */
export const LANDING_ICON_STROKE = 2

export function useScrollReveal(options?: { threshold?: number; rootMargin?: string }) {
  const target = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>
  const isVisible = ref(false)

  useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        isVisible.value = true
      }
    },
    {
      threshold: options?.threshold ?? 0.12,
      rootMargin: options?.rootMargin ?? '0px 0px -48px 0px',
    },
  )

  return { target, isVisible }
}
