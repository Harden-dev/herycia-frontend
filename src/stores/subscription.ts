import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorMessage } from '@/lib/api'
import {
  canPayForPlan,
  getSubscriptionCta,
  hasAnalytics,
  isActive,
  isSubscriptionBlocked,
  isTrial,
  isTrialExpired,
  renewalDaysLeft,
  trialDaysLeft,
} from '@/lib/subscription'
import { fetchPublicPlans } from '@/services/plans.service'
import { fetchSubscriptionDetail } from '@/services/subscription.service'
import type { SubscriptionSummary } from '@/types/auth'
import type {
  PublicPlan,
  SubscriptionDetailData,
  SubscriptionUsage,
} from '@/types/plan'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionSummary | null>(null)
  const usage = ref<SubscriptionUsage | null>(null)
  const publicPlans = ref<PublicPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const upgradeModalOpen = ref(false)
  const blocked = ref(false)

  const trialDaysRemaining = computed(() => trialDaysLeft(subscription.value?.trial_ends_at))
  const renewalDaysRemaining = computed(() => renewalDaysLeft(subscription.value?.ends_at ?? null))
  const showTrialBanner = computed(
    () => isTrial(subscription.value) && !isTrialExpired(subscription.value) && !blocked.value,
  )
  const showPaymentCta = computed(() => {
    const cta = getSubscriptionCta(subscription.value)
    return (cta.type === 'pay' || cta.type === 'upgrade') && !blocked.value
  })
  const subscriptionCta = computed(() => getSubscriptionCta(subscription.value))
  const canUseAnalytics = computed(() => hasAnalytics(subscription.value))
  const canAddEmployee = computed(() => {
    if (!usage.value) return true
    if (usage.value.employees_remaining === null) return true
    return usage.value.employees_remaining > 0
  })
  const isActiveBasic = computed(
    () => isActive(subscription.value) && subscription.value?.plan?.code === 'basic',
  )
  const isTrialActive = computed(() => isTrial(subscription.value) && !isTrialExpired(subscription.value))
  const isSubscriptionActive = computed(() => isActive(subscription.value))

  const upgradePlans = computed(() => {
    const current = subscription.value?.plan
    if (!current) return publicPlans.value.filter((p) => p.code !== 'basic')
    return publicPlans.value.filter(
      (p) => p.code !== current.code && p.price_fcfa > current.price_fcfa,
    )
  })

  function applyDetail(data: SubscriptionDetailData) {
    const sub = data.subscription
    subscription.value = {
      id: sub.id,
      status: sub.status,
      is_trial: sub.is_trial,
      trial_ends_at: sub.trial_ends_at ?? null,
      ends_at: sub.ends_at ?? null,
      plan: {
        code: sub.plan.code,
        name: sub.plan.name,
        price_fcfa: sub.plan.price_fcfa,
        max_employees: sub.plan.max_employees,
        has_analytics: sub.plan.has_analytics,
        has_online_booking: sub.plan.has_online_booking,
      },
    }
    usage.value = data.usage
    blocked.value = isSubscriptionBlocked(subscription.value)
  }

  function setSubscription(data: SubscriptionSummary | null) {
    subscription.value = data
    if (data) blocked.value = isSubscriptionBlocked(data)
  }

  function updateFromSummary(data: SubscriptionSummary) {
    subscription.value = {
      ...subscription.value,
      ...data,
      plan: { ...subscription.value?.plan, ...data.plan },
    }
    blocked.value = isSubscriptionBlocked(subscription.value)
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchSubscriptionDetail()
      if (!response.success) throw new Error(response.message)
      applyDetail(response.data)
      return response.data
    } catch (e) {
      error.value = getApiErrorMessage(e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function ensurePublicPlans() {
    if (publicPlans.value.length) return publicPlans.value
    const response = await fetchPublicPlans()
    if (response.success) publicPlans.value = response.data
    return publicPlans.value
  }

  function getPlanByCode(code: string): PublicPlan | undefined {
    return publicPlans.value.find((p) => p.code === code)
  }

  function canCheckoutPlan(planCode: string): boolean {
    return canPayForPlan(subscription.value, planCode)
  }

  function openUpgradeModal() {
    void ensurePublicPlans()
    upgradeModalOpen.value = true
  }

  function setBlocked(value: boolean) {
    blocked.value = value
  }

  function clear() {
    subscription.value = null
    usage.value = null
    publicPlans.value = []
    error.value = null
    blocked.value = false
    upgradeModalOpen.value = false
  }

  return {
    subscription,
    usage,
    publicPlans,
    loading,
    error,
    upgradeModalOpen,
    blocked,
    trialDaysRemaining,
    renewalDaysRemaining,
    showTrialBanner,
    showPaymentCta,
    subscriptionCta,
    canUseAnalytics,
    canAddEmployee,
    isActiveBasic,
    isTrialActive,
    isSubscriptionActive,
    upgradePlans,
    setSubscription,
    updateFromSummary,
    applyDetail,
    load,
    ensurePublicPlans,
    getPlanByCode,
    canCheckoutPlan,
    openUpgradeModal,
    setBlocked,
    clear,
  }
})
