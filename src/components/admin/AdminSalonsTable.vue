<script setup lang="ts">
import { computed } from 'vue'
import { IconBan, IconEye, IconPencil, IconPlayerPause, IconTrash } from '@tabler/icons-vue'
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
import {
  SUBSCRIPTION_STATUS_LABELS,
  salonStatusClasses,
  salonStatusLabel,
  subscriptionStatusClasses,
} from '@/lib/admin'
import { formatDate, isoToDMY } from '@/lib/utils'
import type { AdminSalonListItem } from '@/types/admin'

defineProps<{
  salons: AdminSalonListItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [salon: AdminSalonListItem]
  edit: [salon: AdminSalonListItem]
  suspend: [salon: AdminSalonListItem]
  deactivate: [salon: AdminSalonListItem]
  delete: [salon: AdminSalonListItem]
}>()

const skeletonRows = computed(() => Array.from({ length: 8 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Nom</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Ville</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Plan</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Expiration</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Créé le</TableHead>
          <TableHead class="w-36 text-right text-xs font-medium text-muted-foreground">
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
        <TableRow v-else-if="salons.length === 0">
          <TableCell colspan="7" class="h-32 text-center text-sm text-muted-foreground">
            Aucun salon trouvé
          </TableCell>
        </TableRow>
        <TableRow v-for="salon in salons" v-else :key="salon.id" class="hover:bg-secondary/40">
          <TableCell>
            <p class="font-medium text-foreground">{{ salon.name }}</p>
            <p class="text-xs text-muted-foreground">{{ salon.slug }}</p>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ salon.city }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            <span v-if="salon.plan_name">{{ salon.plan_name }}</span>
            <span v-if="salon.plan_code" class="text-xs"> ({{ salon.plan_code }})</span>
            <span v-if="!salon.plan_name">—</span>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{
              salon.subscription_ends_at ? isoToDMY(salon.subscription_ends_at) : '—'
            }}
          </TableCell>
          <TableCell>
            <div class="flex flex-col gap-1">
              <span
                class="inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="salonStatusClasses(salon)"
              >
                {{ salonStatusLabel(salon) }}
              </span>
              <span
                v-if="salon.subscription_status"
                class="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="subscriptionStatusClasses(salon.subscription_status)"
              >
                {{ SUBSCRIPTION_STATUS_LABELS[salon.subscription_status] }}
              </span>
            </div>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ formatDate(salon.created_at) }}
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('view', salon)">
                <IconEye :size="16" />
              </Button>
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('edit', salon)">
                <IconPencil :size="16" />
              </Button>
              <Button
                v-if="!salon.is_suspended"
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-warning-600"
                @click="emit('suspend', salon)"
              >
                <IconPlayerPause :size="16" />
              </Button>
              <Button
                v-if="salon.is_active"
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-danger-600"
                @click="emit('deactivate', salon)"
              >
                <IconBan :size="16" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-danger-600"
                @click="emit('delete', salon)"
              >
                <IconTrash :size="16" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
