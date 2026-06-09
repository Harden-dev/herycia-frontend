<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import SubscriptionExpiredWall from '@/components/subscription/SubscriptionExpiredWall.vue'
import SubscriptionTrialBanner from '@/components/subscription/SubscriptionTrialBanner.vue'
import UpgradePremiumDialog from '@/components/subscription/UpgradePremiumDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

const route = useRoute()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const mainRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (authStore.token && authStore.role !== 'super_admin') {
    void subscriptionStore.load()
  }
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    mainRef.value?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-secondary">
    <AppSidebar class="hidden w-60 shrink-0 md:flex" />
    <main ref="mainRef" class="flex-1 overflow-y-auto pb-16 md:pb-0">
      <div class="flex flex-col gap-4 p-4 md:p-6">
        <SubscriptionTrialBanner />
        <RouterView />
      </div>
    </main>
    <BottomNav />
    <SubscriptionExpiredWall />
    <UpgradePremiumDialog v-model:open="subscriptionStore.upgradeModalOpen" />
  </div>
</template>
