<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IconScissors } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { APP_SETTINGS_NAV_ITEM, filterAppNavItems } from '@/lib/app-navigation'
import { resolveMediaUrl } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useSalonStore } from '@/stores/salon'
import { trialDaysLeft } from '@/lib/subscription'
import { useSubscriptionStore } from '@/stores/subscription'

const route = useRoute()
const salonStore = useSalonStore()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const salonName = computed(
  () => salonStore.salon?.name ?? authStore.user?.salon?.name ?? 'Mon salon',
)

const salonLogoUrl = computed(() => {
  const raw = salonStore.salon?.logo_url ?? authStore.user?.salon?.logo_url
  return resolveMediaUrl(raw)
})

const subscription = computed(() => {
  const sub = authStore.user?.subscription
  if (sub && !Array.isArray(sub)) return sub
  return subscriptionStore.subscription
})

const navItems = computed(() =>
  filterAppNavItems(authStore.role, subscriptionStore.canUseAnalytics),
)

const planBadge = computed(() => {
  const sub = subscription.value
  if (!sub) return null
  if (sub.is_trial || sub.status === 'trial') {
    const days = trialDaysLeft(sub.trial_ends_at)
    return `Essai · ${days}j`
  }
  return sub.plan?.name ?? 'Basic'
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <aside class="flex h-full flex-col border-r border-border bg-card">
    <div class="flex items-center gap-3 border-b border-border p-4">
      <div
        class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-600"
      >
        <img
          v-if="salonLogoUrl"
          :src="salonLogoUrl"
          :alt="`Logo ${salonName}`"
          class="h-full w-full object-cover"
        />
        <IconScissors v-else :size="15" :stroke-width="1.5" class="text-white" />
      </div>
      <span class="truncate text-sm font-medium text-foreground" :title="salonName">
        {{ salonName }}
      </span>
    </div>

    <nav class="flex-1 space-y-0.5 p-3">
      <Button
        v-for="item in navItems"
        :key="item.to"
        variant="ghost"
        as-child
        class="w-full justify-start gap-3 rounded-md font-normal hover:bg-success-50"
        :class="
          isActive(item.to)
            ? 'bg-success-50 text-success-800 hover:bg-success-50'
            : 'text-muted-foreground'
        "
      >
        <RouterLink
          :to="item.to"
          class="inline-flex w-full cursor-pointer items-center gap-3 px-3 py-2"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.5" />
          {{ item.label }}
        </RouterLink>
      </Button>
    </nav>

    <Separator />

    <div class="space-y-0.5 p-3">
      <Button
        variant="ghost"
        as-child
        class="w-full justify-start gap-3 font-normal text-muted-foreground hover:bg-success-50"
        :class="isActive('/settings') ? 'bg-success-50 text-success-800 hover:bg-success-50' : ''"
      >
        <RouterLink
          :to="APP_SETTINGS_NAV_ITEM.to"
          class="inline-flex w-full cursor-pointer items-center gap-3 px-3 py-2"
        >
          <component :is="APP_SETTINGS_NAV_ITEM.icon" :size="18" :stroke-width="1.5" />
          {{ APP_SETTINGS_NAV_ITEM.label }}
        </RouterLink>
      </Button>

      <div class="mt-2 rounded-md bg-accent-50 px-3 py-2">
        <p class="text-xs font-medium text-accent-800">
          Plan {{ planBadge }}
        </p>
        <p class="mt-0.5 text-[11px] text-accent-600">
          {{ subscription?.plan?.price_fcfa ?? 0 }} F CFA/mois
        </p>
        <p
          v-if="subscriptionStore.usage && subscriptionStore.usage.max_employees !== null"
          class="mt-0.5 text-[10px] text-accent-600/80"
        >
          {{ subscriptionStore.usage.active_employees }}/{{ subscriptionStore.usage.max_employees }}
          membres
        </p>
      </div>
    </div>
  </aside>
</template>
