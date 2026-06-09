<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { IconPlus } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import UserCreateDialog from '@/components/users/UserCreateDialog.vue'
import UserEditDialog from '@/components/users/UserEditDialog.vue'
import UserToggleStatusDialog from '@/components/users/UserToggleStatusDialog.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import ListToolbar from '@/components/shared/ListToolbar.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUsersStore } from '@/stores/users'
import type { StaffMember } from '@/types'

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const store = useUsersStore()
const searchInput = ref(store.search)
const createOpen = ref(false)
const editOpen = ref(false)
const toggleOpen = ref(false)
const editingUser = ref<StaffMember | null>(null)
const togglingUser = ref<StaffMember | null>(null)

onMounted(async () => {
  await subscriptionStore.load()
  await store.load()
})

watchDebounced(searchInput, (v) => store.setSearch(v), { debounce: 400 })

function onEdit(user: StaffMember) {
  editingUser.value = user
  editOpen.value = true
}

function onToggleStatus(user: StaffMember) {
  togglingUser.value = user
  toggleOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader
      title="Équipe"
      :description="`${store.pagination?.total_rows ?? 0} membre(s)`"
    />
    <p v-if="store.error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ store.error }}
    </p>
    <p
      v-if="!subscriptionStore.canAddEmployee && subscriptionStore.usage"
      class="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-800"
    >
      Limite atteinte ({{ subscriptionStore.usage.active_employees }}/{{
        subscriptionStore.usage.max_employees
      }}
      membres). Passez à Premium pour des employés illimités.
    </p>

    <ListToolbar v-model:search="searchInput" placeholder="Rechercher par nom ou téléphone...">
      <template #actions>
        <Button
          class="cursor-pointer gap-2 bg-primary-600 text-white shadow-[0_4px_14px_rgb(15_110_86_/_0.2)] hover:bg-primary-800"
          :disabled="!subscriptionStore.canAddEmployee"
          @click="createOpen = true"
        >
          <IconPlus :size="16" :stroke-width="2" />
          Ajouter un membre
        </Button>
      </template>
    </ListToolbar>
    <UsersTable
      :users="store.items"
      :loading="store.loading"
      :current-user-id="authStore.user?.id"
      @edit="onEdit"
      @toggle-status="onToggleStatus"
    />
    <AppPagination
      v-if="store.pagination && store.pagination.last_page > 0"
      :pagination="store.pagination"
      @update:page="store.setPage"
    />
    <UserCreateDialog v-model:open="createOpen" />
    <UserEditDialog v-model:open="editOpen" v-model:user="editingUser" />
    <UserToggleStatusDialog v-model:open="toggleOpen" v-model:user="togglingUser" />
  </div>
</template>
