<script setup lang="ts">
import {
  IconCalendarEvent,
  IconCash,
  IconDeviceMobile,
  IconLink,
  IconMessage,
  IconQrcode,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-vue'

const items = [
  { icon: IconLink, label: 'Lien de réservation' },
  { icon: IconCalendarEvent, label: 'Agenda par coiffeur' },
  { icon: IconQrcode, label: 'QR d’arrivée' },
  { icon: IconUsersGroup, label: 'File d’attente' },
  { icon: IconMessage, label: 'SMS « bientôt votre tour »' },
  { icon: IconCash, label: 'Paiements et caisse' },
  { icon: IconUsers, label: 'Équipe et accès' },
  { icon: IconDeviceMobile, label: 'Sur téléphone et ordinateur' },
]
</script>

<template>
  <div
    class="landing-marquee overflow-hidden border-b border-border bg-card py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
    aria-label="Fonctionnalités"
  >
    <ul class="landing-marquee-track flex w-max gap-10">
      <li
        v-for="(item, index) in [...items, ...items]"
        :key="index"
        class="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground"
        :aria-hidden="index >= items.length ? 'true' : undefined"
      >
        <component :is="item.icon" :size="18" class="text-primary-600" />
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>
