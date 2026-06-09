<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BILLING_PAYMENT_METHOD_LABELS,
  BILLING_PAYMENT_STATUS_LABELS,
  billingPaymentStatusClasses,
} from '@/lib/admin'
import { formatCFA, formatDateTimeShort } from '@/lib/utils'
import type { AdminRecentPayment } from '@/types/admin'

defineProps<{
  payments: AdminRecentPayment[]
  loading?: boolean
}>()

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Salon</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Plan</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Montant</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Méthode</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Date</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
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
          <TableCell colspan="6" class="h-28 text-center text-sm text-muted-foreground">
            Aucun paiement récent
          </TableCell>
        </TableRow>
        <TableRow v-for="payment in payments" v-else :key="payment.id" class="hover:bg-secondary/40">
          <TableCell>
            <p class="font-medium text-foreground">{{ payment.salon.name }}</p>
            <p class="text-xs text-muted-foreground">{{ payment.salon.city }}</p>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ payment.plan.name }}
            <span class="text-xs">({{ payment.plan.code }})</span>
          </TableCell>
          <TableCell class="font-medium text-foreground">{{ formatCFA(payment.amount) }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ BILLING_PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ payment.paid_at ? formatDateTimeShort(payment.paid_at) : '—' }}
          </TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="billingPaymentStatusClasses(payment.status)"
            >
              {{ BILLING_PAYMENT_STATUS_LABELS[payment.status] }}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
