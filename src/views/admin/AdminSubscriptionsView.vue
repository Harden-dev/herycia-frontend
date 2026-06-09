<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminSubscriptionEditDialog from '@/components/admin/AdminSubscriptionEditDialog.vue'
import AdminSubscriptionsTable from '@/components/admin/AdminSubscriptionsTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import ListToolbar from '@/components/shared/ListToolbar.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api'
import { FILTER_ALL, SUBSCRIPTION_STATUS_LABELS } from '@/lib/admin'
import { toast } from '@/lib/toast'
import { cancelAdminSubscription, fetchAdminSubscriptions } from '@/services/admin.service'
import type { AdminSubscription, AdminSubscriptionStatus } from '@/types/admin'
import type { PaginationMeta } from '@/types/api'

const items = ref<AdminSubscription[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const statusFilter = ref(FILTER_ALL)
const page = ref(1)

const editOpen = ref(false)
const editingSub = ref<AdminSubscription | null>(null)
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const cancellingSub = ref<AdminSubscription | null>(null)

const statuses = Object.keys(SUBSCRIPTION_STATUS_LABELS) as AdminSubscriptionStatus[]

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminSubscriptions({
      page: page.value,
      per_page: 15,
      search: search.value.trim() || undefined,
      status:
        statusFilter.value !== FILTER_ALL
          ? (statusFilter.value as AdminSubscriptionStatus)
          : undefined,
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

onBeforeRouteLeave(() => {
  editOpen.value = false
  confirmOpen.value = false
})

watchDebounced(search, () => {
  page.value = 1
  load()
}, { debounce: 400 })

async function onConfirmCancel() {
  if (!cancellingSub.value) return
  confirmLoading.value = true
  try {
    const response = await cancelAdminSubscription(cancellingSub.value.id)
    if (!response.success) throw new Error(response.message)
    toast.success(response.message)
    confirmOpen.value = false
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AdminHeader
      title="Souscriptions"
      :description="`${pagination?.total_rows ?? 0} abonnement(s) actif(s) ou historique(s)`"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ListToolbar
        v-model:search="search"
        placeholder="Nom ou slug salon..."
        class="flex-1"
      />
      <Select
        v-model="statusFilter"
        @update:model-value="
          () => {
            page = 1
            load()
          }
        "
      >
        <SelectTrigger class="w-full sm:w-44">
          <SelectValue placeholder="Tous statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="FILTER_ALL">Tous statuts</SelectItem>
          <SelectItem v-for="s in statuses" :key="s" :value="s">
            {{ SUBSCRIPTION_STATUS_LABELS[s] }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <AdminSubscriptionsTable
      :subscriptions="items"
      :loading="loading"
      @edit="(sub) => { editingSub = sub; editOpen = true }"
      @cancel="(sub) => { cancellingSub = sub; confirmOpen = true }"
    />

    <AppPagination
      v-if="pagination && pagination.last_page > 0"
      :pagination="pagination"
      @update:page="(p) => { page = p; load() }"
    />

    <AdminSubscriptionEditDialog
      v-model:open="editOpen"
      v-model:subscription="editingSub"
      @saved="load"
    />

    <AdminConfirmDialog
      v-model:open="confirmOpen"
      title="Annuler la souscription"
      description="Le statut passera à « Annulé »."
      confirm-label="Annuler la souscription"
      :loading="confirmLoading"
      destructive
      @confirm="onConfirmCancel"
    />
  </div>
</template>
