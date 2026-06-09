<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IconLogout } from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRole } from '@/lib/roles'
import { initials } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)
const displayName = computed(() => user.value?.name ?? 'Utilisateur')
const displayRole = computed(() =>
  user.value?.role ? formatRole(user.value.role) : '',
)

async function onLogout() {
  await authStore.logoutRemote()
  await router.push('/login')
}
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger
      class="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Avatar class="h-9 w-9 cursor-pointer border border-border">
        <AvatarFallback class="bg-primary-50 text-xs font-medium text-primary-800">
          {{ initials(displayName) }}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="font-normal">
        <p class="text-sm font-medium text-foreground">{{ displayName }}</p>
        <p class="text-xs text-muted-foreground">{{ displayRole }}</p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="cursor-pointer text-danger-600 focus:bg-danger-50 focus:text-danger-800 data-[highlighted]:bg-danger-50 data-[highlighted]:text-danger-800 [&_svg]:text-danger-600 data-[highlighted]:[&_svg]:text-danger-800"
        @click="onLogout"
      >
        <IconLogout :size="16" :stroke-width="2" class="mr-2" />
        Se déconnecter
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
