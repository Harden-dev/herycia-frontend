<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminSalonEditDialog from '@/components/admin/AdminSalonEditDialog.vue'
import AdminSalonsTable from '@/components/admin/AdminSalonsTable.vue'
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
import { FILTER_ALL, SALON_CITIES } from '@/lib/admin'
import { toast } from '@/lib/toast'
import {
  deactivateAdminSalon,
  deleteAdminSalon,
  fetchAdminSalons,
  suspendAdminSalon,
} from '@/services/admin.service'
import type { AdminSalonListItem } from '@/types/admin'
import type { PaginationMeta } from '@/types/api'

const router = useRouter()
const items = ref<AdminSalonListItem[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const cityFilter = ref(FILTER_ALL)
const statusFilter = ref(FILTER_ALL)
const page = ref(1)

const editOpen = ref(false)
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const editingSalon = ref<AdminSalonListItem | null>(null)
const confirmAction = ref<'suspend' | 'deactivate' | 'delete' | null>(null)
const targetSalon = ref<AdminSalonListItem | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminSalons({
      page: page.value,
      per_page: 15,
      search: search.value.trim() || undefined,
      city: cityFilter.value !== FILTER_ALL ? cityFilter.value : undefined,
      is_active: statusFilter.value === 'inactive' ? false : undefined,
      is_suspended: statusFilter.value === 'suspended' ? true : undefined,
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

function onPageChange(p: number) {
  page.value = p
  load()
}

function onFilterChange() {
  page.value = 1
  load()
}

function onEdit(salon: AdminSalonListItem) {
  editingSalon.value = salon
  editOpen.value = true
}

function onView(salon: AdminSalonListItem) {
  router.push({ name: 'admin-salon-detail', params: { id: salon.id } })
}

function openConfirm(action: 'suspend' | 'deactivate' | 'delete', salon: AdminSalonListItem) {
  confirmAction.value = action
  targetSalon.value = salon
  confirmOpen.value = true
}

const confirmMeta = {
  suspend: {
    title: 'Suspendre le salon',
    description: 'Le salon sera marqué comme suspendu mais restera en base.',
    label: 'Suspendre',
  },
  deactivate: {
    title: 'Désactiver le salon',
    description: 'Le salon ne pourra plus être utilisé par ses utilisateurs.',
    label: 'Désactiver',
  },
  delete: {
    title: 'Supprimer définitivement',
    description: 'Cette action est irréversible. Tous les utilisateurs liés seront supprimés.',
    label: 'Supprimer',
  },
} as const

const confirmDialog = computed(() =>
  confirmAction.value ? confirmMeta[confirmAction.value] : null,
)

async function onConfirm() {
  if (!targetSalon.value || !confirmAction.value) return
  confirmLoading.value = true
  try {
    let response
    if (confirmAction.value === 'suspend') {
      response = await suspendAdminSalon(targetSalon.value.id)
    } else if (confirmAction.value === 'deactivate') {
      response = await deactivateAdminSalon(targetSalon.value.id)
    } else {
      response = await deleteAdminSalon(targetSalon.value.id)
    }
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
      title="Salons"
      :description="`${pagination?.total_rows ?? 0} salon(s) inscrit(s)`"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <ListToolbar v-model:search="search" placeholder="Nom, slug ou WhatsApp..." class="flex-1" />
      <Select v-model="cityFilter" @update:model-value="onFilterChange">
        <SelectTrigger class="w-full sm:w-44">
          <SelectValue placeholder="Toutes les villes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="FILTER_ALL">Toutes les villes</SelectItem>
          <SelectItem v-for="c in SALON_CITIES" :key="c" :value="c">{{ c }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="statusFilter" @update:model-value="onFilterChange">
        <SelectTrigger class="w-full sm:w-40">
          <SelectValue placeholder="Tous statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="FILTER_ALL">Tous statuts</SelectItem>
          <SelectItem value="suspended">Suspendus</SelectItem>
          <SelectItem value="inactive">Désactivés</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <AdminSalonsTable
      :salons="items"
      :loading="loading"
      @view="onView"
      @edit="onEdit"
      @suspend="openConfirm('suspend', $event)"
      @deactivate="openConfirm('deactivate', $event)"
      @delete="openConfirm('delete', $event)"
    />

    <AppPagination
      v-if="pagination && pagination.last_page > 0"
      :pagination="pagination"
      @update:page="onPageChange"
    />

    <AdminSalonEditDialog v-model:open="editOpen" v-model:salon="editingSalon" @saved="load" />

    <AdminConfirmDialog
      v-if="confirmDialog"
      v-model:open="confirmOpen"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :confirm-label="confirmDialog.label"
      :loading="confirmLoading"
      destructive
      @confirm="onConfirm"
    />
  </div>
</template>
