<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PAYMENT_METHOD_LABELS } from '@/lib/permissions'
import type { PaymentListItem } from '@/types'
import { formatCFA, formatDateTimeShort } from '@/lib/utils'

defineProps<{
  payments: PaymentListItem[]
  loading?: boolean
}>()

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Montant</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Méthode</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Client</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">RDV</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Payé le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="(_, i) in skeletonRows" :key="i">
            <TableCell v-for="col in 6" :key="col">
              <Skeleton class="h-5 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else-if="payments.length === 0">
          <TableCell colspan="6" class="h-32 text-center text-sm text-muted-foreground">
            Aucun paiement
          </TableCell>
        </TableRow>
        <TableRow
          v-for="payment in payments"
          v-else
          :key="payment.id"
          class="hover:bg-secondary/40"
        >
          <TableCell class="font-medium text-foreground">{{ formatCFA(payment.amount) }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
          </TableCell>
          <TableCell class="text-sm text-foreground">
            {{ payment.client?.name ?? '—' }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            <template v-if="payment.appointment">
              {{ formatDateTimeShort(payment.appointment.scheduled_at) }}
              <span v-if="payment.appointment.service?.name" class="block text-[11px]">
                {{ payment.appointment.service.name }}
              </span>
            </template>
            <span v-else>—</span>
          </TableCell>
          <TableCell>
            <StatusBadge :status="payment.status" />
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ formatDateTimeShort(payment.paid_at) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
