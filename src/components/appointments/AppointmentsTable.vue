<script setup lang="ts">
import { computed } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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
import type { AppointmentListItem, AppointmentStatus } from '@/types'
import { formatCFA, formatDateTimeShort, formatPhone } from '@/lib/utils'

defineProps<{
  appointments: AppointmentListItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: AppointmentStatus]
  cancel: [id: string]
}>()

const skeletonRows = computed(() => Array.from({ length: 6 }))

const nextStatuses: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Date / heure</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Client</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Coiffeur</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Service</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="w-12 text-right text-xs font-medium text-muted-foreground" />
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
        <TableRow v-else-if="appointments.length === 0">
          <TableCell colspan="6" class="h-32 text-center text-sm text-muted-foreground">
            Aucun rendez-vous pour cette date
          </TableCell>
        </TableRow>
        <TableRow
          v-for="appt in appointments"
          v-else
          :key="appt.id"
          class="hover:bg-secondary/40"
        >
          <TableCell class="text-sm text-foreground">
            {{ formatDateTimeShort(appt.scheduled_at) }}
          </TableCell>
          <TableCell>
            <p class="text-sm font-medium text-foreground">{{ appt.client.name }}</p>
            <p class="font-mono text-[11px] text-muted-foreground">
              {{ formatPhone(appt.client.phone) }}
            </p>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ appt.staff.name }}</TableCell>
          <TableCell>
            <p class="text-sm text-foreground">{{ appt.service.name }}</p>
            <p class="text-[11px] text-muted-foreground">
              {{ appt.service.duration_min }} min · {{ formatCFA(appt.service.price) }}
            </p>
          </TableCell>
          <TableCell>
            <StatusBadge :status="appt.status" />
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu v-if="nextStatuses[appt.status]?.length">
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="cursor-pointer text-xs">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  v-for="status in nextStatuses[appt.status]"
                  :key="status"
                  class="cursor-pointer"
                  @click="
                    status === 'cancelled'
                      ? emit('cancel', appt.id)
                      : emit('update-status', appt.id, status!)
                  "
                >
                  {{
                    status === 'cancelled'
                      ? 'Annuler'
                      : status === 'confirmed'
                        ? 'Confirmer'
                        : status === 'in_progress'
                          ? 'Démarrer'
                          : status === 'completed'
                            ? 'Terminer'
                            : 'Absent'
                  }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
