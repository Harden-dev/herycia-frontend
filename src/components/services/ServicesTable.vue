<script setup lang="ts">
import { computed } from 'vue'
import { IconPencil, IconTrash } from '@tabler/icons-vue'
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
import type { SalonService } from '@/types'
import { formatCFA } from '@/lib/utils'

defineProps<{
  services: SalonService[]
  loading?: boolean
  canManage?: boolean
}>()

const emit = defineEmits<{
  edit: [service: SalonService]
  deactivate: [id: string]
}>()

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Prestation</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Durée</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Prix</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead v-if="canManage" class="w-24 text-right text-xs font-medium text-muted-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="(_, i) in skeletonRows" :key="i">
            <TableCell v-for="col in canManage ? 5 : 4" :key="col">
              <Skeleton class="h-5 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else-if="services.length === 0">
          <TableCell :colspan="canManage ? 5 : 4" class="h-32 text-center text-sm text-muted-foreground">
            Aucune prestation
          </TableCell>
        </TableRow>
        <TableRow
          v-for="service in services"
          v-else
          :key="service.id"
          class="hover:bg-secondary/40"
        >
          <TableCell class="font-medium text-foreground">{{ service.name }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ service.duration_min }} min</TableCell>
          <TableCell class="text-sm font-medium text-foreground">
            {{ formatCFA(service.price) }}
          </TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="
                service.is_active
                  ? 'bg-success-50 text-success-800'
                  : 'bg-secondary text-muted-foreground'
              "
            >
              {{ service.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </TableCell>
          <TableCell v-if="canManage" class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                class="cursor-pointer text-primary-600 hover:bg-primary-50"
                title="Modifier"
                @click="emit('edit', service)"
              >
                <IconPencil :size="16" />
              </Button>
              <Button
                v-if="service.is_active"
                variant="ghost"
                size="icon-sm"
                class="cursor-pointer text-danger-600 hover:bg-danger-50"
                title="Désactiver"
                @click="emit('deactivate', service.id)"
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
