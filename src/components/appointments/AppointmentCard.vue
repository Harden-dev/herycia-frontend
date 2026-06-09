<script setup lang="ts">
import { IconScissors } from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { Appointment } from '@/types'
import { formatPhone, formatTime, initials } from '@/lib/utils'

defineProps<{
  appointment: Appointment
}>()

const emit = defineEmits<{
  'open-detail': [id: string]
}>()
</script>

<template>
  <div
    class="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-primary-400"
    @click="emit('open-detail', appointment.id)"
  >
    <div class="flex items-center gap-3">
      <Avatar class="h-9 w-9">
        <AvatarFallback class="bg-primary-50 text-xs font-medium text-primary-800">
          {{ initials(appointment.client.name) }}
        </AvatarFallback>
      </Avatar>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-foreground">
          {{ appointment.client.name }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ appointment.service.name }} · {{ appointment.service.duration_min }} min ·
          {{ appointment.service.price.toLocaleString('fr-CI') }} F
        </p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-sm font-medium">{{ formatTime(appointment.scheduled_at) }}</p>
        <StatusBadge :status="appointment.status" class="mt-0.5" />
      </div>
    </div>
    <Separator class="my-3" />
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <IconScissors :size="14" :stroke-width="1.5" />
      <span>Avec {{ appointment.employee.name }}</span>
      <span class="ml-auto font-mono">{{ formatPhone(appointment.client.phone) }}</span>
    </div>
  </div>
</template>
