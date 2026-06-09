<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminUserResetPasswordDialog from '@/components/admin/AdminUserResetPasswordDialog.vue'
import AdminUsersTable from '@/components/admin/AdminUsersTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import ListToolbar from '@/components/shared/ListToolbar.vue'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api'
import { USER_TYPE_TABS } from '@/lib/admin'
import { toast } from '@/lib/toast'
import { blockAdminUser, fetchAdminUsers } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import type { AdminPlatformUser, AdminUserType } from '@/types/admin'
import type { PaginationMeta } from '@/types/api'

const authStore = useAuthStore()
const items = ref<AdminPlatformUser[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const userType = ref<AdminUserType | null>(null)
const page = ref(1)

const resetOpen = ref(false)
const resetUser = ref<AdminPlatformUser | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminUsers({
      page: page.value,
      per_page: 15,
      search: search.value.trim() || undefined,
      user_type: userType.value ?? undefined,
    })
    if (!response.success) throw new Error(response.message)
    items.value = response.data
    pagination.value = response.pagination
  } catch (e) {
    error.value = getApiErrorMessage(e)
    items.value = []
    pagination.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watchDebounced(search, () => {
  page.value = 1
  load()
}, { debounce: 400 })

function setUserType(type: AdminUserType | null) {
  userType.value = type
  page.value = 1
  load()
}

async function onBlock(user: AdminPlatformUser) {
  try {
    const response = await blockAdminUser(user.id)
    if (!response.success) throw new Error(response.message)
    toast.success(response.message)
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  }
}

function onResetPassword(user: AdminPlatformUser) {
  resetUser.value = user
  resetOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AdminHeader
      title="Utilisateurs"
      :description="`${pagination?.total_rows ?? 0} utilisateur(s) plateforme`"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="flex flex-wrap gap-2">
      <Button
        v-for="tab in USER_TYPE_TABS"
        :key="tab.label"
        variant="outline"
        size="sm"
        class="rounded-full"
        :class="
          userType === tab.value
            ? 'border-primary-600 bg-primary-50 text-primary-800'
            : 'text-muted-foreground'
        "
        @click="setUserType(tab.value)"
      >
        {{ tab.label }}
      </Button>
    </div>

    <ListToolbar v-model:search="search" placeholder="Nom, email ou téléphone..." />

    <AdminUsersTable
      :users="items"
      :loading="loading"
      :current-user-id="authStore.user?.id"
      @block="onBlock"
      @reset-password="onResetPassword"
    />

    <AppPagination
      v-if="pagination && pagination.last_page > 0"
      :pagination="pagination"
      @update:page="(p) => { page = p; load() }"
    />

    <AdminUserResetPasswordDialog
      v-model:open="resetOpen"
      v-model:user="resetUser"
    />
  </div>
</template>
