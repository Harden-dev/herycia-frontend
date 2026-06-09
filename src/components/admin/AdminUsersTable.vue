<script setup lang="ts">
import { computed } from 'vue'
import { IconKey, IconUserOff, IconUserCheck } from '@tabler/icons-vue'
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
import { ADMIN_ROLE_LABELS } from '@/lib/admin'
import { formatPhone } from '@/lib/utils'
import type { AdminPlatformUser } from '@/types/admin'

defineProps<{
  users: AdminPlatformUser[]
  loading?: boolean
  currentUserId?: string
}>()

const emit = defineEmits<{
  block: [user: AdminPlatformUser]
  'reset-password': [user: AdminPlatformUser]
}>()

const skeletonRows = computed(() => Array.from({ length: 8 }))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-secondary/60 hover:bg-secondary/60">
          <TableHead class="text-xs font-medium text-muted-foreground">Nom</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Téléphone</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Email</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Rôle</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Salon</TableHead>
          <TableHead class="text-xs font-medium text-muted-foreground">Statut</TableHead>
          <TableHead class="w-28 text-right text-xs font-medium text-muted-foreground">
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
        <TableRow v-else-if="users.length === 0">
          <TableCell colspan="7" class="h-32 text-center text-sm text-muted-foreground">
            Aucun utilisateur
          </TableCell>
        </TableRow>
        <TableRow v-for="user in users" v-else :key="user.id" class="hover:bg-secondary/40">
          <TableCell class="font-medium text-foreground">{{ user.name }}</TableCell>
          <TableCell class="font-mono text-xs text-muted-foreground">
            {{ formatPhone(user.phone) }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ user.email ?? '—' }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ ADMIN_ROLE_LABELS[user.role] ?? user.role }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ user.salon?.name ?? '—' }}
          </TableCell>
          <TableCell>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="
                user.is_active
                  ? 'bg-success-50 text-success-800'
                  : 'bg-danger-50 text-danger-800'
              "
            >
              {{ user.is_active ? 'Actif' : 'Bloqué' }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                :disabled="user.id === currentUserId"
                :title="user.is_active ? 'Bloquer' : 'Débloquer'"
                @click="emit('block', user)"
              >
                <IconUserOff v-if="user.is_active" :size="16" />
                <IconUserCheck v-else :size="16" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                @click="emit('reset-password', user)"
              >
                <IconKey :size="16" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
