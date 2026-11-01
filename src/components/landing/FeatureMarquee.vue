<script setup lang="ts">
import { IconScissors } from '@tabler/icons-vue'

/** Bandeau géant sur deux lignes, en sens inverse : les prestations des salons. */
const rows = [
  ['Tresses', 'Coupe homme', 'Coloration', 'Tissage', 'Barbe', 'Nattes'],
  ['Lissage', 'Locks', 'Défrisage', 'Chignon', 'Soins', 'Brushing'],
]
</script>

<template>
  <div
    class="landing-marquee landing-cream overflow-hidden border-y border-foreground/10 py-8 md:py-12"
    aria-label="Prestations"
  >
    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="overflow-hidden py-1">
      <ul
        class="landing-marquee-track flex w-max items-center gap-8 md:gap-12"
        :class="rowIndex === 1 && 'is-reverse'"
      >
        <li
          v-for="(item, index) in [...row, ...row]"
          :key="index"
          class="flex items-center gap-8 whitespace-nowrap md:gap-12"
          :aria-hidden="index >= row.length ? 'true' : undefined"
        >
          <span
            class="text-[44px] font-semibold uppercase leading-none tracking-tight md:text-[84px]"
            :class="rowIndex === 1 ? 'landing-outline text-foreground/40' : 'text-foreground'"
          >
            {{ item }}
          </span>
          <IconScissors class="h-8 w-8 shrink-0 text-primary-600 md:h-14 md:w-14" :stroke-width="1.5" />
        </li>
      </ul>
    </div>
  </div>
</template>
