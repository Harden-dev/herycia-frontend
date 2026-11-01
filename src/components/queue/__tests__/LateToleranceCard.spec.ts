import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type * as SalonService from '@/services/salon.service'
import type { SalonDetail } from '@/types/salon'

const salonService = vi.hoisted(() => ({
  updateSalon: vi.fn<typeof SalonService.updateSalon>(),
}))
vi.mock('@/services/salon.service', () => salonService)

import LateToleranceCard from '@/components/queue/LateToleranceCard.vue'

describe('LateToleranceCard', () => {
  beforeEach(() => {
    salonService.updateSalon.mockReset()
    salonService.updateSalon.mockResolvedValue({
      success: true,
      message: 'OK',
      data: { late_tolerance_minutes: 20 } as SalonDetail,
    })
  })

  it('enregistre la durée choisie parmi les préréglages', async () => {
    const wrapper = mount(LateToleranceCard, { props: { minutes: 15 } })
    const submit = wrapper.get('button[type="submit"]')
    expect(submit.attributes('disabled')).toBeDefined()

    const twenty = wrapper.findAll('[role="radio"]').find((b) => b.text() === '20 min')!
    await twenty.trigger('click')
    expect(twenty.attributes('aria-checked')).toBe('true')
    expect(wrapper.text()).toContain('arrivée acceptée jusqu’à 10:20')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(salonService.updateSalon).toHaveBeenCalledWith({ late_tolerance_minutes: 20 })
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('accepte une durée personnalisée et refuse une valeur hors limites', async () => {
    const wrapper = mount(LateToleranceCard, { props: { minutes: 15 } })
    const custom = wrapper.get('input[type="number"]')
    expect((custom.element as HTMLInputElement).value).toBe('')

    await custom.setValue('25')
    expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('jusqu’à 10:25')

    await custom.setValue('90')
    expect(wrapper.text()).toContain('entre 0 et 60 minutes')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
