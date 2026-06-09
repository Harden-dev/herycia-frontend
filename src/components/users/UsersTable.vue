<script setup lang="ts">
import { computed } from 'vue'
import { IconPencil, IconUserCheck, IconUserOff } from '@tabler/icons-vue'
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
import { STAFF_ROLE_LABELS } from '@/lib/permissions'
import type { StaffMember } from '@/types'
import { formatPhone } from '@/lib/utils'

defineProps<{
  users: StaffMember[]
  loading?: boolean
  currentUserId?: string
}>()

const emit = defineEmits<{
  edit: [user: StaffMember]
  'toggle-status': [user: StaffMember]
}>()

const skeletonRows = computed(() => Array.from({ length: 5 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Nom</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Téléphone</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Rôle</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="w-24 text-right text-xs font-medium text-muted-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="(_, i) in skeletonRows" :key="i">
            <TableCell v-for="col in 5" :key="col">
              <Skeleton class="h-5 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else-if="users.length === 0">
          <TableCell colspan="5" class="h-32 text-center text-sm text-muted-foreground">
            Aucun membre
          </TableCell>
        </TableRow>
        <TableRow v-for="member in users" v-else :key="member.id" class="hover:bg-secondary/40">
          <TableCell class="font-medium text-foreground">{{ member.name }}</TableCell>
          <TableCell class="font-mono text-xs text-muted-foreground">
            {{ formatPhone(member.phone) }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ STAFF_ROLE_LABELS[member.role] ?? member.role }}
          </TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="
                member.is_active
                  ? 'bg-success-50 text-success-800'
                  : 'bg-secondary text-muted-foreground'
              "
            >
              {{ member.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                class="cursor-pointer text-primary-600 hover:bg-primary-50"
                title="Modifier"
                @click="emit('edit', member)"
              >
                <IconPencil :size="16" />
              </Button>
              <Button
                v-if="member.id !== currentUserId"
                variant="ghost"
                size="icon-sm"
                class="cursor-pointer"
                :class="
                  member.is_active
                    ? 'text-warning-600 hover:bg-warning-50'
                    : 'text-success-600 hover:bg-success-50'
                "
                :title="member.is_active ? 'Désactiver' : 'Réactiver'"
                @click="emit('toggle-status', member)"
              >
                <IconUserOff v-if="member.is_active" :size="16" />
                <IconUserCheck v-else :size="16" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
