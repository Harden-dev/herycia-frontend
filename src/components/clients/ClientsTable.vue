<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { IconBrandWhatsapp, IconCheck, IconDots, IconEye, IconTrash } from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Client } from '@/types'
import { formatDateTimeShort, formatPhone, initials } from '@/lib/utils'

defineProps<{
  clients: Client[]
  loading?: boolean
}>()

function clientStatus(client: Client) {
  if (!client.last_visit_at) {
    return { label: 'Nouveau', class: 'bg-accent-50 text-accent-800', icon: IconDots }
  }
  const days = (Date.now() - new Date(client.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 30) {
    return { label: 'Actif', class: 'bg-success-50 text-success-800', icon: IconCheck }
  }
  return { label: 'Inactif', class: 'bg-secondary text-muted-foreground', icon: IconDots }
}

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Nom complet</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Dernière visite</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">WhatsApp</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Visites</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="w-[100px] text-right text-xs font-medium text-muted-foreground">
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

        <TableRow v-else-if="clients.length === 0">
          <TableCell colspan="7" class="h-32 text-center text-sm text-muted-foreground">
            Aucun client trouvé
          </TableCell>
        </TableRow>

        <TableRow
          v-for="client in clients"
          v-else
          :key="client.id"
          class="transition-colors hover:bg-secondary/40"
        >
          <TableCell>
            <div class="flex items-center gap-3">
              <Avatar class="h-8 w-8">
                <AvatarFallback class="bg-primary-50 text-[10px] font-medium text-primary-800">
                  {{ initials(client.name) }}
                </AvatarFallback>
              </Avatar>
              <span class="text-sm font-medium text-foreground">{{ client.name }}</span>
            </div>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ client.last_visit_at ? formatDateTimeShort(client.last_visit_at) : '—' }}
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <IconBrandWhatsapp :size="16" :stroke-width="2" class="text-primary-600" />
              <span class="font-mono text-xs">{{ formatPhone(client.phone) }}</span>
            </div>
          </TableCell>
          <TableCell class="text-sm font-medium text-foreground">
            {{ client.total_visits ?? 0 }}
          </TableCell>
          <TableCell>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              :class="clientStatus(client).class"
            >
              <component :is="clientStatus(client).icon" :size="12" :stroke-width="2" />
              {{ clientStatus(client).label }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon-sm" as-child>
                <RouterLink :to="`/clients/${client.id}`" aria-label="Voir la fiche">
                  <IconEye :size="16" :stroke-width="2" />
                </RouterLink>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon-sm" aria-label="Plus d'actions">
                    <IconTrash :size="16" :stroke-width="2" class="text-danger-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    class="text-danger-600 focus:bg-danger-50 focus:text-danger-800 data-[highlighted]:bg-danger-50 data-[highlighted]:text-danger-800"
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
