<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { IconPlus } from '@tabler/icons-vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminPlanFormDialog from '@/components/admin/AdminPlanFormDialog.vue'
import AdminPlansTable from '@/components/admin/AdminPlansTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api'
import { FILTER_ALL } from '@/lib/admin'
import { toast } from '@/lib/toast'
import { archiveAdminPlan, fetchAdminPlans } from '@/services/admin.service'
import type { AdminPlan } from '@/types/admin'
import type { PaginationMeta } from '@/types/api'

const items = ref<AdminPlan[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const archivedFilter = ref(FILTER_ALL)

const formOpen = ref(false)
const editingPlan = ref<AdminPlan | null>(null)
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const archivingPlan = ref<AdminPlan | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminPlans({
      page: page.value,
      per_page: 15,
      include_archived:
        archivedFilter.value === 'archived'
          ? true
          : archivedFilter.value === 'active'
            ? false
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
  formOpen.value = false
  confirmOpen.value = false
})

function onCreate() {
  editingPlan.value = null
  formOpen.value = true
}

function onEdit(plan: AdminPlan) {
  editingPlan.value = plan
  formOpen.value = true
}

function onArchive(plan: AdminPlan) {
  archivingPlan.value = plan
  confirmOpen.value = true
}

async function onConfirmArchive() {
  if (!archivingPlan.value) return
  confirmLoading.value = true
  try {
    const response = await archiveAdminPlan(archivingPlan.value.id)
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
      title="Plans"
      :description="`${pagination?.total_rows ?? 0} offre(s) commerciale(s)`"
    >
      <template #actions>
        <Button
          class="gap-2 bg-primary-600 text-white hover:bg-primary-800"
          @click="onCreate"
        >
          <IconPlus :size="16" />
          Nouveau plan
        </Button>
      </template>
    </AdminHeader>

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <Select v-model="archivedFilter" class="w-full sm:w-48" @update:model-value="page = 1; load()">
      <SelectTrigger>
        <SelectValue placeholder="Tous les plans" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="FILTER_ALL">Tous</SelectItem>
        <SelectItem value="active">Actifs</SelectItem>
        <SelectItem value="archived">Archivés</SelectItem>
      </SelectContent>
    </Select>

    <AdminPlansTable
      :plans="items"
      :loading="loading"
      @edit="onEdit"
      @archive="onArchive"
    />

    <AppPagination
      v-if="pagination && pagination.last_page > 0"
      :pagination="pagination"
      @update:page="(p) => { page = p; load() }"
    />

    <AdminPlanFormDialog
      v-model:open="formOpen"
      v-model:plan="editingPlan"
      @saved="load"
    />

    <AdminConfirmDialog
      v-model:open="confirmOpen"
      title="Archiver le plan"
      description="Ce plan ne sera plus proposé aux nouvelles souscriptions."
      confirm-label="Archiver"
      :loading="confirmLoading"
      @confirm="onConfirmArchive"
    />
  </div>
</template>
