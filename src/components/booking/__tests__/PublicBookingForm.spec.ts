import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PublicBookingForm from '@/components/booking/PublicBookingForm.vue'

async function fillForm(phone: string) {
  const wrapper = mount(PublicBookingForm, {
    props: {
      employees: [{ id: 'emp-1', name: 'Awa' }],
      services: [{ id: 'svc-1', name: 'Coupe', duration_min: 30, price: 3000 }],
    },
  })
  await wrapper.find('.booking-service-card').trigger('click')
  await wrapper.find('.booking-employee-chip').trigger('click')
  await wrapper.find('#booking-date').setValue('2026-11-20')
  await wrapper.find('#booking-time').setValue('10:30')
  await wrapper.find('#client-name').setValue('  Awa Traoré ')
  await wrapper.find('#client-phone').setValue(phone)
  return wrapper
}

describe('PublicBookingForm', () => {
  it('envoie le numéro normalisé', async () => {
    const wrapper = await fillForm('07 07 07 07 07')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      client_name: 'Awa Traoré',
      client_phone: '2250707070707',
      service_id: 'svc-1',
      user_id: 'emp-1',
    })
  })

  it('bloque un numéro invalide avant l’envoi', async () => {
    const wrapper = await fillForm('08 07 07 07 07')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Le numéro doit commencer par 01, 05, 07, 21, 25 ou 27')
  })

  it('affiche une erreur 422 par champ et l’efface quand le champ est modifié', async () => {
    const wrapper = await fillForm('0707070707')
    await wrapper.setProps({
      serverErrors: {
        client_name: 'Ce nom contient des caractères non autorisés : /',
        client_phone: 'Numéro refusé par le serveur',
      },
    })

    expect(wrapper.text()).toContain('Ce nom contient des caractères non autorisés : /')
    expect(wrapper.find('#client-name').attributes('aria-invalid')).toBe('true')

    await wrapper.find('#client-name').setValue('Awa')

    expect(wrapper.text()).not.toContain('Ce nom contient des caractères non autorisés')
    expect(wrapper.text()).toContain('Numéro refusé par le serveur')
  })

  it('limite la saisie du nom à 100 caractères', () => {
    const wrapper = mount(PublicBookingForm, { props: { employees: [], services: [] } })
    expect(wrapper.find('#client-name').attributes('maxlength')).toBe('100')
  })
})
