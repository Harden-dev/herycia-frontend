<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminBillingPaymentsTable from '@/components/admin/AdminBillingPaymentsTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api'
import { BILLING_PAYMENT_STATUS_LABELS, FILTER_ALL } from '@/lib/admin'
import { fetchAdminBillingPayments } from '@/services/admin.service'
import type { AdminBillingPayment, AdminBillingPaymentStatus } from '@/types/admin'
import type { PaginationMeta } from '@/types/api'

const items = ref<AdminBillingPayment[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const from = ref('')
const to = ref('')
const statusFilter = ref(FILTER_ALL)

const statuses = Object.keys(BILLING_PAYMENT_STATUS_LABELS) as AdminBillingPaymentStatus[]

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminBillingPayments({
      page: page.value,
      per_page: 15,
      from: from.value || undefined,
      to: to.value || undefined,
      status:
        statusFilter.value !== FILTER_ALL
          ? (statusFilter.value as AdminBillingPaymentStatus)
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

function onFilter() {
  page.value = 1
  load()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AdminHeader
      title="Paiements SaaS"
      description="Facturation abonnements plateforme (Wave, Orange Money…)"
    />

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <div class="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-2">
        <Label for="from">Du</Label>
        <Input id="from" v-model="from" type="date" @change="onFilter" />
      </div>
      <div class="space-y-2">
        <Label for="to">Au</Label>
        <Input id="to" v-model="to" type="date" @change="onFilter" />
      </div>
      <div class="space-y-2 sm:col-span-2">
        <Label>Statut</Label>
        <Select v-model="statusFilter" @update:model-value="onFilter">
          <SelectTrigger>
            <SelectValue placeholder="Tous statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="FILTER_ALL">Tous statuts</SelectItem>
            <SelectItem v-for="s in statuses" :key="s" :value="s">
              {{ BILLING_PAYMENT_STATUS_LABELS[s] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <AdminBillingPaymentsTable :payments="items" :loading="loading" />

    <AppPagination
      v-if="pagination && pagination.last_page > 0"
      :pagination="pagination"
      @update:page="(p) => { page = p; load() }"
    />
  </div>
</template>
