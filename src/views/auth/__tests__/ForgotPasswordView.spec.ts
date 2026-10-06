import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import type * as AuthService from '@/services/auth.service'

const services = vi.hoisted(() => ({
  forgotPasswordRequest: vi.fn<typeof AuthService.forgotPasswordRequest>(),
  verifyResetCodeRequest: vi.fn<typeof AuthService.verifyResetCodeRequest>(),
  resetPasswordRequest: vi.fn<typeof AuthService.resetPasswordRequest>(),
}))
vi.mock('@/services/auth.service', () => services)

import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
      { path: '/login', name: 'login', component: { template: '<div />' } },
    ],
  })
}

async function mountView() {
  const router = makeRouter()
  await router.push('/forgot-password')
  await router.isReady()
  const wrapper = mount(ForgotPasswordView, { global: { plugins: [router] } })
  return { wrapper, router }
}

async function fill(wrapper: ReturnType<typeof mount>, id: string, value: string) {
  await wrapper.find(`#${id}`).setValue(value)
}

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('enchaîne email → code → nouveau mot de passe puis renvoie vers la connexion', async () => {
    services.forgotPasswordRequest.mockResolvedValue({
      success: true,
      message: 'Si cet email existe, un code de réinitialisation a été envoyé',
      data: { expires_in: 10 },
    })
    services.verifyResetCodeRequest.mockResolvedValue({
      success: true,
      message: 'ok',
      data: { token: 'reset-token', expires_in: 15 },
    })
    services.resetPasswordRequest.mockResolvedValue({ success: true, message: 'ok', data: null })

    const { wrapper, router } = await mountView()

    await fill(wrapper, 'reset-email', ' Gerant@Salon.CI ')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(services.forgotPasswordRequest).toHaveBeenCalledWith('gerant@salon.ci')
    expect(wrapper.text()).toContain('Si cet email existe')

    await fill(wrapper, 'reset-code', '123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(services.verifyResetCodeRequest).toHaveBeenCalledWith('gerant@salon.ci', '123456')

    await fill(wrapper, 'reset-password', 'Nouveau1!')
    await fill(wrapper, 'reset-password-confirmation', 'Nouveau1!')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(services.resetPasswordRequest).toHaveBeenCalledWith({
      token: 'reset-token',
      email: 'gerant@salon.ci',
      password: 'Nouveau1!',
      password_confirmation: 'Nouveau1!',
    })
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.reset).toBe('success')
  })

  it("refuse un mot de passe qui ne respecte pas les règles sans appeler l'API", async () => {
    services.forgotPasswordRequest.mockResolvedValue({
      success: true,
      message: 'ok',
      data: { expires_in: 10 },
    })
    services.verifyResetCodeRequest.mockResolvedValue({
      success: true,
      message: 'ok',
      data: { token: 'reset-token', expires_in: 15 },
    })

    const { wrapper } = await mountView()
    await fill(wrapper, 'reset-email', 'gerant@salon.ci')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await fill(wrapper, 'reset-code', '123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    await fill(wrapper, 'reset-password', 'simple')
    await fill(wrapper, 'reset-password-confirmation', 'simple')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(services.resetPasswordRequest).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('ne respecte pas toutes les règles')
  })

  it('affiche le message du backend quand le code est incorrect et reste sur l’étape du code', async () => {
    services.forgotPasswordRequest.mockResolvedValue({
      success: true,
      message: 'ok',
      data: { expires_in: 10 },
    })
    services.verifyResetCodeRequest.mockRejectedValue(new Error('Code incorrect.'))

    const { wrapper } = await mountView()
    await fill(wrapper, 'reset-email', 'gerant@salon.ci')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await fill(wrapper, 'reset-code', '000000')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Code incorrect.')
    expect(wrapper.find('#reset-code').exists()).toBe(true)
  })
})
