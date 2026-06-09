<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { IconPlus } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ServiceCreateDialog from '@/components/services/ServiceCreateDialog.vue'
import ServiceEditDialog from '@/components/services/ServiceEditDialog.vue'
import ServicesTable from '@/components/services/ServicesTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import ListToolbar from '@/components/shared/ListToolbar.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useServicesStore } from '@/stores/services'
import { canManageServices } from '@/lib/permissions'
import type { SalonService } from '@/types'

const authStore = useAuthStore()
const store = useServicesStore()
const searchInput = ref(store.search)
const createOpen = ref(false)
const editOpen = ref(false)
const editingService = ref<SalonService | null>(null)

function onEdit(service: SalonService) {
  editingService.value = service
  editOpen.value = true
}
const canManage = computed(() => canManageServices(authStore.role))

onMounted(() => store.load())

watchDebounced(searchInput, (v) => store.setSearch(v), { debounce: 400 })
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader
      title="Prestations"
      :description="`${store.pagination?.total_rows ?? 0} service(s)`"
    />
    <p v-if="store.error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ store.error }}
    </p>
    <ListToolbar v-model:search="searchInput" placeholder="Rechercher une prestation...">
      <template v-if="canManage" #actions>
        <Button
          class="cursor-pointer gap-2 bg-primary-600 text-white shadow-[0_4px_14px_rgb(15_110_86_/_0.2)] hover:bg-primary-800"
          @click="createOpen = true"
        >
          <IconPlus :size="16" :stroke-width="2" />
          Ajouter une prestation
        </Button>
      </template>
    </ListToolbar>
    <ServicesTable
      :services="store.items"
      :loading="store.loading"
      :can-manage="canManage"
      @edit="onEdit"
      @deactivate="store.deactivate"
    />
    <AppPagination
      v-if="store.pagination && store.pagination.last_page > 0"
      :pagination="store.pagination"
      @update:page="store.setPage"
    />
    <ServiceCreateDialog v-if="canManage" v-model:open="createOpen" />
    <ServiceEditDialog
      v-if="canManage"
      v-model:open="editOpen"
      v-model:service="editingService"
    />
  </div>
</template>
