<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconPlus } from '@tabler/icons-vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { mobileMoreNavItems, mobilePrimaryNavItems } from '@/lib/app-navigation'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const moreOpen = ref(false)

const primaryItems = computed(() =>
  mobilePrimaryNavItems(authStore.role, subscriptionStore.canUseAnalytics),
)

const moreItems = computed(() =>
  mobileMoreNavItems(authStore.role, subscriptionStore.canUseAnalytics),
)

const morePaths = computed(() => moreItems.value.map((item) => item.to))

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const isMoreActive = computed(() => morePaths.value.some((path) => isActive(path)))

function openMore() {
  moreOpen.value = true
}

function navigateMore(to: string) {
  moreOpen.value = false
  void router.push(to)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card md:hidden"
    aria-label="Navigation principale"
  >
    <RouterLink
      v-for="item in primaryItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2 text-[11px] transition-colors duration-150"
      :class="isActive(item.to) ? 'text-primary-800' : 'text-muted-foreground'"
      :aria-label="item.label"
    >
      <component :is="item.icon" :size="20" :stroke-width="1.5" />
      <span>{{ item.label }}</span>
    </RouterLink>

    <button
      type="button"
      class="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2 text-[11px] transition-colors duration-150"
      :class="isMoreActive ? 'text-primary-800' : 'text-muted-foreground'"
      aria-label="Plus d'options"
      @click="openMore"
    >
      <IconPlus :size="20" :stroke-width="1.5" />
      <span>Plus</span>
    </button>
  </nav>

  <Sheet v-model:open="moreOpen">
    <SheetContent side="bottom" class="rounded-t-2xl px-4 pb-8 pt-6">
      <SheetHeader class="mb-4 text-left">
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>

      <div class="grid gap-1">
        <button
          v-for="item in moreItems"
          :key="item.to"
          type="button"
          class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-success-50"
          :class="isActive(item.to) ? 'bg-success-50 font-medium text-success-800' : 'text-foreground'"
          @click="navigateMore(item.to)"
        >
          <component :is="item.icon" :size="20" :stroke-width="1.5" />
          {{ item.label }}
        </button>
      </div>
    </SheetContent>
  </Sheet>
</template>
