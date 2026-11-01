import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import type * as PlansService from '@/services/plans.service'
import type { PublicPlan } from '@/types/plan'

const plansService = vi.hoisted(() => ({
  fetchPublicPlans: vi.fn<typeof PlansService.fetchPublicPlans>(),
}))
vi.mock('@/services/plans.service', () => plansService)

// jsdom n'implémente pas IntersectionObserver, utilisé par les apparitions au défilement.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  },
)

import PricingSection from '@/components/landing/PricingSection.vue'

const mountSection = () => mount(PricingSection, { global: { stubs: { RouterLink: RouterLinkStub } } })

describe('PricingSection', () => {
  beforeEach(() => {
    plansService.fetchPublicPlans.mockReset()
  })

  it('affiche les offres de secours quand l’API échoue', async () => {
    plansService.fetchPublicPlans.mockImplementation(() => Promise.reject(new Error('réseau')))
    const wrapper = mountSection()
    await flushPromises()

    const text = wrapper.get('[data-testid="pricing-plans"]').text()
    expect(text).toContain('Basic')
    expect(text).toContain('5 000 F')
    expect(text).toContain('Pro')
    expect(text).toContain('15 000 F')
  })

  it('remplace les offres de secours par celles de l’API', async () => {
    const plan: PublicPlan = {
      id: 'p1',
      code: 'basic',
      name: 'Essentiel',
      tagline: null,
      price_fcfa: 7000,
      price_label: '7 000 F /mois',
      max_employees: 3,
      max_employees_label: '3 membres du personnel',
      has_online_booking: true,
      has_analytics: false,
      features: [{ key: 'agenda', label: 'Agenda + rendez-vous', included: true }],
    }
    plansService.fetchPublicPlans.mockResolvedValue({ success: true, message: 'OK', data: [plan] })
    const wrapper = mountSection()
    await flushPromises()

    const text = wrapper.get('[data-testid="pricing-plans"]').text()
    expect(text).toContain('Essentiel')
    expect(text).toContain('7 000 F')
    expect(text).not.toContain('15 000 F')
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/register?plan=basic')
  })
})
