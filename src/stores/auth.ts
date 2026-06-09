import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiRequestError, getApiErrorMessage, toApiRequestError, validationErrorsFromBody } from '@/lib/api'
import { fetchAdminMe } from '@/services/admin.service'
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '@/services/auth.service'
import type {
  AuthenticatedUser,
  LoginPayload,
  RegisterPayload,
  SalonSummary,
  SubscriptionSummary,
} from '@/types/auth'
import { useAdminStore } from '@/stores/admin'
import { useSalonStore } from '@/stores/salon'
import { SELECTED_PLAN_KEY } from '@/lib/subscription'
import { useSubscriptionStore } from '@/stores/subscription'

const TOKEN_KEY = 'herycia_token'
const USER_KEY = 'herycia_user'

function loadUser(): AuthenticatedUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthenticatedUser
  } catch {
    return null
  }
}

function normalizeSubscription(
  sub: SubscriptionSummary | SubscriptionSummary[] | null | undefined,
): SubscriptionSummary | null {
  if (!sub) return null
  return Array.isArray(sub) ? (sub[0] ?? null) : sub
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthenticatedUser | null>(loadUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const role = computed(() => user.value?.role)

  function hydrateStores(authUser: AuthenticatedUser, subscription?: SubscriptionSummary | null) {
    if (authUser.role === 'super_admin') return

    const sub = normalizeSubscription(subscription ?? authUser.subscription)
    const salon = authUser.salon

    if (salon) {
      useSalonStore().setSalon({
        id: salon.id,
        name: salon.name,
        slug: salon.slug,
        booking_link: salon.booking_link,
        logo_url: salon.logo_url ?? null,
        phone: authUser.phone,
      })
    }

    if (sub) {
      useSubscriptionStore().setSubscription({
        id: sub.id,
        status: sub.status,
        is_trial: sub.is_trial,
        trial_ends_at: sub.trial_ends_at ?? null,
        ends_at: sub.ends_at ?? null,
        plan: sub.plan
          ? {
              code: sub.plan.code,
              name: sub.plan.name,
              price_fcfa: sub.plan.price_fcfa,
              max_employees: sub.plan.max_employees ?? null,
              has_analytics: sub.plan.has_analytics ?? false,
              has_online_booking: sub.plan.has_online_booking ?? true,
            }
          : { code: 'basic', name: 'Basic', price_fcfa: 5000, has_analytics: false },
      })
    }
  }

  function setSession(accessToken: string, authUser: AuthenticatedUser) {
    token.value = accessToken
    user.value = authUser
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    hydrateStores(authUser)
  }

  function updateSalonBranding(data: Partial<SalonSummary>) {
    if (!user.value?.salon) return
    user.value = {
      ...user.value,
      salon: { ...user.value.salon, ...data },
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    hydrateStores(user.value)
  }

  function logout() {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    useSalonStore().setSalon(null)
    useSubscriptionStore().clear()
    useAdminStore().clearProfile()
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const response = await loginRequest(payload)
      if (!response.success) throw new Error(response.message)
      const { access_token, user: authUser, subscription } = response.data
      if (subscription && authUser) authUser.subscription = subscription
      setSession(access_token, authUser)
      if (authUser.role !== 'super_admin') void useSubscriptionStore().load()
      return response
    } catch (e) {
      error.value = getApiErrorMessage(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const response = await registerRequest(payload)
      if (!response.success) {
        throw new ApiRequestError(
          response.message,
          validationErrorsFromBody(response as { message: string; errors?: Record<string, string[]> }),
        )
      }
      const { access_token, user: authUser, salon, subscription } = response.data
      const mergedUser: AuthenticatedUser = {
        ...authUser,
        salon: authUser.salon ?? salon,
        subscription: authUser.subscription ?? subscription,
      }
      setSession(access_token, mergedUser)
      localStorage.removeItem(SELECTED_PLAN_KEY)
      void useSubscriptionStore().load()
      return response
    } catch (e) {
      const apiError = toApiRequestError(e)
      error.value = apiError.message
      throw apiError
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const currentRole = user.value?.role
      if (currentRole === 'super_admin') {
        const response = await fetchAdminMe()
        if (!response.success) throw new Error(response.message)
        const profile = response.data
        const mergedUser: AuthenticatedUser = {
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          role: 'super_admin',
          is_active: profile.is_active,
          salon: null,
          created_at: profile.created_at,
        }
        setSession(token.value, mergedUser)
        useAdminStore().setProfile(profile)
        return
      }

      const response = await meRequest()
      if (!response.success) throw new Error(response.message)
      const { user: authUser, salon, subscription } = response.data
      const mergedUser: AuthenticatedUser = {
        ...authUser,
        salon: authUser.salon ?? {
          id: salon.id,
          name: salon.name,
          slug: salon.slug,
          booking_link: salon.booking_link,
          logo_url: 'logo_url' in salon ? salon.logo_url : null,
        },
      }
      setSession(token.value, mergedUser)
      hydrateStores(mergedUser, subscription)
      void useSubscriptionStore().load()
    } catch {
      logout()
    }
  }

  async function logoutRemote() {
    try {
      await logoutRequest()
    } finally {
      logout()
    }
  }

  return {
    token,
    user,
    role,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    fetchMe,
    logout,
    logoutRemote,
    updateSalonBranding,
  }
})
