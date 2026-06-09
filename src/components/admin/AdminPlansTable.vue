<script setup lang="ts">
import { computed } from 'vue'
import { IconArchive, IconPencil } from '@tabler/icons-vue'
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
import { formatCFA } from '@/lib/utils'
import type { AdminPlan } from '@/types/admin'

defineProps<{
  plans: AdminPlan[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [plan: AdminPlan]
  archive: [plan: AdminPlan]
}>()

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Nom</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Code</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Prix</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Employés max</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Services max</TableHead>
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
        <TableRow v-else-if="plans.length === 0">
          <TableCell colspan="7" class="h-32 text-center text-sm text-muted-foreground">
            Aucun plan
          </TableCell>
        </TableRow>
        <TableRow v-for="plan in plans" v-else :key="plan.id" class="hover:bg-secondary/40">
          <TableCell class="font-medium text-foreground">{{ plan.name }}</TableCell>
          <TableCell class="font-mono text-xs text-muted-foreground">{{ plan.code }}</TableCell>
          <TableCell class="text-sm text-foreground">{{ formatCFA(plan.price_fcfa) }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ plan.max_employees }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ plan.max_services }}</TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="
                plan.is_archived
                  ? 'bg-secondary text-muted-foreground'
                  : 'bg-success-50 text-success-800'
              "
            >
              {{ plan.is_archived ? 'Archivé' : 'Actif' }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('edit', plan)">
                <IconPencil :size="16" />
              </Button>
              <Button
                v-if="!plan.is_archived"
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                @click="emit('archive', plan)"
              >
                <IconArchive :size="16" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
