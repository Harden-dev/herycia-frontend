<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { IconArrowLeft } from '@tabler/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { fetchClient } from '@/services/clients.service'
import type { ClientDetail } from '@/types'
import { formatCFA, formatDateTimeShort, formatPhone } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/permissions'

const route = useRoute()
const client = ref<ClientDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const response = await fetchClient(route.params.id as string)
    if (!response.success) throw new Error(response.message)
    client.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink
      to="/clients"
      class="inline-flex w-fit cursor-pointer items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
    >
      <IconArrowLeft :size="16" />
      Retour aux clients
    </RouterLink>

    <template v-if="loading">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-40 w-full rounded-xl" />
    </template>

    <p v-else-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <template v-else-if="client">
      <AppHeader
        :title="client.name"
        :description="formatPhone(client.phone)"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-border bg-card p-5">
          <p class="text-xs text-muted-foreground">Visites</p>
          <p class="mt-1 text-2xl font-medium text-foreground">{{ client.total_visits ?? 0 }}</p>
        </div>
        <div class="rounded-xl border border-border bg-card p-5">
          <p class="text-xs text-muted-foreground">Dernière visite</p>
          <p class="mt-1 text-sm font-medium text-foreground">
            {{
              client.last_visit_at ? formatDateTimeShort(client.last_visit_at) : '—'
            }}
          </p>
        </div>
      </div>

      <section class="rounded-xl border border-border bg-card">
        <h2 class="border-b border-border px-5 py-3 text-sm font-medium text-foreground">
          Historique RDV
        </h2>
        <ul v-if="client.appointments.length" class="divide-y divide-border">
          <li
            v-for="appt in client.appointments"
            :key="appt.id"
            class="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div>
              <p class="text-sm font-medium text-foreground">{{ appt.service.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ appt.staff.name }} · {{ formatDateTimeShort(appt.scheduled_at) }}
              </p>
            </div>
            <StatusBadge :status="appt.status" />
          </li>
        </ul>
        <p v-else class="px-5 py-8 text-center text-sm text-muted-foreground">Aucun RDV</p>
      </section>

      <section class="rounded-xl border border-border bg-card">
        <h2 class="border-b border-border px-5 py-3 text-sm font-medium text-foreground">
          Paiements
        </h2>
        <ul v-if="client.payments.length" class="divide-y divide-border">
          <li
            v-for="pay in client.payments"
            :key="pay.id"
            class="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div>
              <p class="text-sm font-medium text-foreground">{{ formatCFA(pay.amount) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ PAYMENT_METHOD_LABELS[pay.method] }} · {{ formatDateTimeShort(pay.paid_at) }}
              </p>
            </div>
            <StatusBadge :status="pay.status" />
          </li>
        </ul>
        <p v-else class="px-5 py-8 text-center text-sm text-muted-foreground">Aucun paiement</p>
      </section>
    </template>
  </div>
</template>
