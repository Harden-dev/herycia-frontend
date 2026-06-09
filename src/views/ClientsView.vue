<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { IconFilter, IconPlus } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import ListToolbar from '@/components/shared/ListToolbar.vue'
import ClientsTable from '@/components/clients/ClientsTable.vue'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'

const clientsStore = useClientsStore()
const searchInput = ref(clientsStore.search)

onMounted(() => {
  clientsStore.load()
})

watchDebounced(
  searchInput,
  (value) => {
    clientsStore.setSearch(value)
  },
  { debounce: 400 },
)

function onPageChange(page: number) {
  clientsStore.setPage(page)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader
      title="Clients"
      :description="`${clientsStore.pagination?.total_rows ?? 0} client(s) enregistré(s)`"
    />

    <p v-if="clientsStore.error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ clientsStore.error }}
    </p>

    <ListToolbar v-model:search="searchInput" placeholder="Rechercher un client...">
      <template #actions>
        <Button
          variant="outline"
          class="cursor-pointer gap-2 border-border bg-card hover:bg-secondary"
        >
          <IconFilter :size="16" :stroke-width="2" />
          Filtres
        </Button>
        <!-- <Button class="cursor-pointer gap-2 bg-primary-600 text-white hover:bg-primary-800">
          <IconPlus :size="16" :stroke-width="2" />
          Ajouter un client
        </Button> -->
      </template>
    </ListToolbar>

    <!-- Table -->
    <ClientsTable :clients="clientsStore.clients" :loading="clientsStore.loading" />

    <!-- Pagination -->
    <AppPagination
      v-if="clientsStore.pagination && clientsStore.pagination.last_page > 0"
      :pagination="clientsStore.pagination"
      @update:page="onPageChange"
    />
  </div>
</template>
