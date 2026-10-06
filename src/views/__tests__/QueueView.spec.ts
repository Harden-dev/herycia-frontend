import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type * as QueueService from '@/services/queue.service'
import type { QueueBoard } from '@/types/queue'

const queue = vi.hoisted(() => ({
  fetchQueueBoard: vi.fn<typeof QueueService.fetchQueueBoard>(),
  applyQueueAction: vi.fn<typeof QueueService.applyQueueAction>(),
  staffCheckIn: vi.fn<typeof QueueService.staffCheckIn>(),
  staffLateChoice: vi.fn<typeof QueueService.staffLateChoice>(),
}))
vi.mock('@/services/queue.service', () => queue)
vi.mock('@/components/layout/AppHeader.vue', () => ({
  default: { template: '<header><slot name="actions" /></header>' },
}))

import QueueView from '@/views/QueueView.vue'

const board: QueueBoard = {
  late_tolerance_minutes: 15,
  stylists: [
    {
      id: 'st-1',
      name: 'Koffi',
      queue: [
        {
          id: 'entry-1',
          status: 'waiting',
          source: 'late',
          position: 1,
          estimated_start_at: '2026-10-10T10:30:00+00:00',
          arrived_at: null,
          called_at: null,
          started_at: null,
          client: { id: 'c1', name: 'Awa', phone: '2250707000001' },
          service: { id: 's1', name: 'Tresse', duration_min: 60 },
          appointment: { id: 'a1', scheduled_at: '2026-10-10T09:30:00+00:00' },
        },
      ],
      expected: [
        {
          id: 'appt-2',
          scheduled_at: '2026-10-10T11:00:00+00:00',
          status: 'confirmed',
          is_late: false,
          client: { id: 'c2', name: 'Yao', phone: '2250707000002' },
          service: { id: 's1', name: 'Tresse', duration_min: 60 },
        },
      ],
    },
  ],
}

describe('QueueView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    queue.fetchQueueBoard.mockResolvedValue({ success: true, message: '', data: board })
  })

  it('affiche la file et les clients attendus par coiffeur', async () => {
    const wrapper = mount(QueueView)
    await flushPromises()

    expect(wrapper.text()).toContain('Koffi')
    expect(wrapper.findAll('[data-testid="queue-row"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Awa')
    expect(wrapper.text()).toContain('retard')
    expect(wrapper.findAll('[data-testid="queue-expected"]')).toHaveLength(1)
  })

  it('appelle un client puis recharge le tableau', async () => {
    queue.applyQueueAction.mockResolvedValue({
      success: true,
      message: '',
      data: board.stylists[0]!.queue[0]!,
    })
    const wrapper = mount(QueueView)
    await flushPromises()

    const callButton = wrapper.findAll('button').find((b) => b.text() === 'Appeler')
    await callButton!.trigger('click')
    await flushPromises()

    expect(queue.applyQueueAction).toHaveBeenCalledWith('entry-1', 'call')
    expect(queue.fetchQueueBoard).toHaveBeenCalledTimes(2)
  })

  it("enregistre l'arrivée d'un client attendu", async () => {
    queue.staffCheckIn.mockResolvedValue({
      success: true,
      message: '',
      data: {
        status: 'queued',
        entry: {
          tracking_token: 't',
          tracking_link: null,
          status: 'waiting',
          source: 'appointment',
          position: 2,
          people_ahead: 1,
          estimated_start_at: null,
          arrived_at: null,
          called_at: null,
          client: { name: 'Yao' },
          service: { name: 'Tresse', duration_min: 60 },
          stylist: { name: 'Koffi' },
          salon: { name: 'Salon', slug: 'salon' },
        },
      },
    })
    const wrapper = mount(QueueView)
    await flushPromises()

    const arrivedButton = wrapper.findAll('button').find((b) => b.text().includes('Arrivé'))
    await arrivedButton!.trigger('click')
    await flushPromises()

    expect(queue.staffCheckIn).toHaveBeenCalledWith('appt-2')
  })
})
