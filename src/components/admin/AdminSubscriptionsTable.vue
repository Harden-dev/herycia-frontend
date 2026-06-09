<script setup lang="ts">
import { computed } from 'vue'
import { IconBan, IconPencil } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SUBSCRIPTION_STATUS_LABELS, subscriptionStatusClasses } from '@/lib/admin'
import { formatCFA, isoToDMY } from '@/lib/utils'
import type { AdminSubscription } from '@/types/admin'

defineProps<{
  subscriptions: AdminSubscription[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [sub: AdminSubscription]
  cancel: [sub: AdminSubscription]
}>()

const skeletonRows = computed(() => Array.from({ length: 8 }))

function formatDate(iso: string | null | undefined) {
  const formatted = isoToDMY(iso)
  return formatted || '—'
}

function expiryDate(sub: AdminSubscription) {
  const date = sub.is_trial ? sub.trial_ends_at : sub.ends_at
  return formatDate(date)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Salon</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Plan</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Début</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Expiration</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Montant</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="w-24 text-right text-xs font-medium text-muted-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="(_, i) in skeletonRows" :key="i">
            <TableCell v-for="col in 7" :key="col">
              <Skeleton class="h-5 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else-if="subscriptions.length === 0">
          <TableCell colspan="7" class="h-32 text-center text-sm text-muted-foreground">
            Aucune souscription
          </TableCell>
        </TableRow>
        <TableRow
          v-for="sub in subscriptions"
          v-else
          :key="sub.id"
          class="hover:bg-secondary/40"
        >
          <TableCell>
            <p class="font-medium text-foreground">{{ sub.salon.name }}</p>
            <p class="text-xs text-muted-foreground">{{ sub.salon.city }}</p>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ sub.plan.name }} ({{ sub.plan.code }})
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ formatDate(sub.started_at) }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ expiryDate(sub) }}</TableCell>
          <TableCell class="text-sm text-foreground">{{ formatCFA(sub.plan.price_fcfa) }}</TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="subscriptionStatusClasses(sub.status)"
            >
              {{ SUBSCRIPTION_STATUS_LABELS[sub.status] }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('edit', sub)">
                <IconPencil :size="16" />
              </Button>
              <Button
                v-if="sub.status !== 'cancelled'"
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-danger-600"
                @click="emit('cancel', sub)"
              >
                <IconBan :size="16" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
