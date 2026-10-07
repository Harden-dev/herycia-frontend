import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import type * as QueueService from '@/services/queue.service'
import type { CheckInResult } from '@/types/queue'

const queue = vi.hoisted(() => ({
  publicCheckIn: vi.fn<typeof QueueService.publicCheckIn>(),
  publicLateChoice: vi.fn<typeof QueueService.publicLateChoice>(),
  fetchPublicWalkIn: vi.fn<typeof QueueService.fetchPublicWalkIn>(),
  publicWalkIn: vi.fn<typeof QueueService.publicWalkIn>(),
}))
vi.mock('@/services/queue.service', () => queue)

import CheckInView from '@/views/public/CheckInView.vue'

const entry = {
  tracking_token: 'file-token',
  tracking_link: null,
  status: 'waiting' as const,
  source: 'appointment' as const,
  position: 2,
  people_ahead: 1,
  estimated_start_at: '2026-10-10T10:30:00+00:00',
  arrived_at: null,
  called_at: null,
  client: { name: 'Awa' },
  service: { name: 'Tresse', duration_min: 60 },
  stylist: { name: 'Koffi' },
  salon: { name: 'Salon Test', slug: 'salon-test' },
}

const lateResult: CheckInResult = {
  status: 'late',
  late_tolerance_minutes: 15,
  appointment: {
    tracking_token: 'rdv-token',
    tracking_link: null,
    scheduled_at: '2026-10-10T09:30:00+00:00',
    rescheduled_from: null,
    service: { name: 'Tresse' },
    stylist: { name: 'Koffi' },
    client: { name: 'Awa' },
  },
  options: {
    reschedule: { scheduled_at: '2026-10-12T09:30:00+00:00' },
    queue: { position: 3, people_ahead: 2, estimated_start_at: '2026-10-10T11:00:00+00:00' },
  },
}

async function mountView(query = '?k=cle') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/arrivee/:slug', name: 'checkin', component: CheckInView },
      { path: '/file/:token', name: 'queue-track', component: { template: '<div />' } },
    ],
  })
  await router.push(`/arrivee/salon-test${query}`)
  await router.isReady()
  return { wrapper: mount(CheckInView, { global: { plugins: [router] } }), router }
}

describe('CheckInView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirige vers le suivi quand le client est à l’heure', async () => {
    queue.publicCheckIn.mockResolvedValue({
      success: true,
      message: '',
      data: { status: 'queued', entry },
    })
    const { wrapper, router } = await mountView()

    await wrapper.find('#checkin-phone').setValue('0707000001')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(queue.publicCheckIn).toHaveBeenCalledWith('salon-test', {
      key: 'cle',
      phone: '0707000001',
    })
    expect(router.currentRoute.value.name).toBe('queue-track')
    expect(router.currentRoute.value.params.token).toBe('file-token')
  })

  it('propose les deux choix au client en retard puis le place après le dernier', async () => {
    queue.publicCheckIn.mockResolvedValue({ success: true, message: '', data: lateResult })
    queue.publicLateChoice.mockResolvedValue({
      success: true,
      message: '',
      data: { status: 'queued', entry },
    })
    const { wrapper, router } = await mountView()

    await wrapper.find('#checkin-phone').setValue('0707000001')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Vous êtes en retard')
    expect(wrapper.text()).toContain('Passer après le dernier de la liste')
    expect(wrapper.text()).toContain('Revenir un autre jour, à la même heure')

    const queueButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Passer après le dernier'))
    await queueButton!.trigger('click')
    await flushPromises()

    expect(queue.publicLateChoice).toHaveBeenCalledWith('salon-test', {
      key: 'cle',
      tracking_token: 'rdv-token',
      choice: 'queue',
    })
    expect(router.currentRoute.value.name).toBe('queue-track')
  })

  it('affiche la nouvelle date quand le client choisit de reprogrammer', async () => {
    queue.publicCheckIn.mockResolvedValue({ success: true, message: '', data: lateResult })
    queue.publicLateChoice.mockResolvedValue({
      success: true,
      message: '',
      data: {
        status: 'rescheduled',
        appointment: { ...lateResult.appointment, scheduled_at: '2026-10-12T09:30:00+00:00' },
      },
    })
    const { wrapper } = await mountView()

    await wrapper.find('#checkin-phone').setValue('0707000001')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const rescheduleButton = wrapper.findAll('button').find((b) => b.text().includes('autre jour'))
    await rescheduleButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Rendez-vous reprogrammé')
  })

  it('utilise le rendez-vous mémorisé sur le téléphone sans demander le numéro', async () => {
    const now = new Date()
    localStorage.setItem(
      'herycia_bookings',
      JSON.stringify([
        { slug: 'salon-test', tracking_token: 'rdv-memo', scheduled_at: now.toISOString() },
      ]),
    )
    queue.publicCheckIn.mockResolvedValue({
      success: true,
      message: '',
      data: { status: 'queued', entry },
    })
    const { wrapper } = await mountView()

    const memoButton = wrapper.findAll('button').find((b) => b.text().includes('C’est moi'))
    await memoButton!.trigger('click')
    await flushPromises()

    expect(queue.publicCheckIn).toHaveBeenCalledWith('salon-test', {
      key: 'cle',
      tracking_token: 'rdv-memo',
    })
  })

  it('signale un lien incomplet sans clé de QR', async () => {
    const { wrapper } = await mountView('')
    expect(wrapper.text()).toContain('Ce lien est incomplet')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('permet à un client sans rendez-vous de rejoindre la file avec le premier coiffeur disponible', async () => {
    const services = [{ id: 'svc-1', name: 'Coupe homme', duration_min: 30, price: 2000 }]
    queue.fetchPublicWalkIn.mockImplementation(async (_slug, _key, serviceId) => ({
      success: true,
      message: '',
      data: {
        salon: { name: 'Salon Test', slug: 'salon-test' },
        services,
        options: serviceId
          ? {
              first_available: {
                stylist: { id: 'st-2', name: 'Aya' },
                position: 1,
                estimated_start_at: '2026-10-10T10:00:00+00:00',
              },
              stylists: [
                {
                  stylist: { id: 'st-1', name: 'Koffi' },
                  position: 3,
                  people_ahead: 2,
                  estimated_start_at: '2026-10-10T11:00:00+00:00',
                  available: true,
                },
                {
                  stylist: { id: 'st-2', name: 'Aya' },
                  position: 1,
                  people_ahead: 0,
                  estimated_start_at: '2026-10-10T10:00:00+00:00',
                  available: true,
                },
              ],
            }
          : null,
      },
    }))
    queue.publicWalkIn.mockResolvedValue({
      success: true,
      message: '',
      data: { status: 'queued', entry },
    })
    const { wrapper, router } = await mountView()

    await wrapper.find('[data-testid="walkin-link"]').trigger('click')
    await flushPromises()
    await wrapper.find('#walkin-service').setValue('svc-1')
    await flushPromises()

    expect(wrapper.text()).toContain('Premier coiffeur disponible')
    expect(wrapper.text()).toContain('Aya')

    await wrapper.find('#walkin-name').setValue('Moussa')
    await wrapper.find('#walkin-phone').setValue('0707999001')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(queue.publicWalkIn).toHaveBeenCalledWith('salon-test', {
      key: 'cle',
      service_id: 'svc-1',
      stylist_id: null,
      name: 'Moussa',
      phone: '0707999001',
    })
    expect(router.currentRoute.value.name).toBe('queue-track')
  })
})
