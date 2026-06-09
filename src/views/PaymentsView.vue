<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconPlus } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PaymentCreateDialog from '@/components/payments/PaymentCreateDialog.vue'
import PaymentsTable from '@/components/payments/PaymentsTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaymentsStore } from '@/stores/payments'
import { formatCFA } from '@/lib/utils'

const store = usePaymentsStore()
const createOpen = ref(false)

onMounted(() => {
  store.loadSummary()
  store.load()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader title="Paiements" description="Historique et caisse du salon" />

    <div class="flex justify-end">
      <Button
        class="cursor-pointer gap-2 bg-primary-600 text-white shadow-[0_4px_14px_rgb(184_134_11_/_0.2)] hover:bg-primary-800"
        @click="createOpen = true"
      >
        <IconPlus :size="16" :stroke-width="2" />
        Enregistrer un paiement
      </Button>
    </div>

    <p v-if="store.error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ store.error }}
    </p>

    <div class="grid gap-4 sm:grid-cols-3">
      <template v-if="store.summaryLoading">
        <Skeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
      </template>
      <template v-else-if="store.summary">
        <div
          v-for="(block, key) in {
            Jour: store.summary.day,
            Semaine: store.summary.week,
            Mois: store.summary.month,
          }"
          :key="key"
          class="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {{ key }}
          </p>
          <p class="mt-2 text-2xl font-medium text-foreground">{{ formatCFA(block.total) }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ block.count }} paiement(s)</p>
        </div>
      </template>
    </div>

    <PaymentsTable :payments="store.items" :loading="store.loading" />
    <AppPagination
      v-if="store.pagination && store.pagination.last_page > 0"
      :pagination="store.pagination"
      @update:page="store.setPage"
    />
    <PaymentCreateDialog v-model:open="createOpen" />
  </div>
</template>
