<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  IconBuildingStore,
  IconCash,
  IconLayoutDashboard,
  IconPackage,
  IconRefresh,
  IconScissors,
  IconUsers,
} from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: IconLayoutDashboard, exact: true },
  { label: 'Salons', to: '/admin/salons', icon: IconBuildingStore, exact: false },
  { label: 'Plans', to: '/admin/plans', icon: IconPackage, exact: false },
  { label: 'Souscriptions', to: '/admin/subscriptions', icon: IconRefresh, exact: false },
  { label: 'Paiements', to: '/admin/billing-payments', icon: IconCash, exact: false },
  { label: 'Utilisateurs', to: '/admin/users', icon: IconUsers, exact: false },
]

function isActive(path: string, exact: boolean) {
  if (exact) return route.path === path
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <aside class="flex h-full flex-col border-r border-border bg-card">
    <div class="border-b border-border p-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 shadow-sm"
        >
          <IconScissors :size="16" :stroke-width="1.5" class="text-white" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-foreground">HERYCIA</p>
          <p class="text-[11px] text-muted-foreground">Super Admin</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-0.5 p-3">
      <Button
        v-for="item in navItems"
        :key="item.to"
        variant="ghost"
        as-child
        class="w-full justify-start gap-3 rounded-md font-normal hover:bg-primary-50"
        :class="
          isActive(item.to, item.exact)
            ? 'bg-primary-50 text-primary-800 hover:bg-primary-50'
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

    <div class="p-4">
      <div class="rounded-lg bg-primary-50 px-3 py-2.5">
        <p class="text-xs font-medium text-primary-800">Plateforme Herycia</p>
        <p class="mt-0.5 text-[11px] text-primary-600/80">Suivi & facturation SaaS</p>
      </div>
    </div>
  </aside>
</template>
