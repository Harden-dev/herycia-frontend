<script setup lang="ts">
import { IconCalendar, IconCash, IconUsers } from '@tabler/icons-vue'

const appointments = [
  { name: 'Koffi Atta', service: 'Coupe homme', time: '10h00' },
  { name: 'Awa Diallo', service: 'Tresse', time: '11h30' },
]
</script>

<template>
  <aside
    class="auth-brand-grid relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex lg:w-[46%] xl:w-[48%]"
  >
    <!-- Floating cards -->
    <div class="relative mx-auto mt-6 w-full max-w-md flex-1">
      <div class="auth-float-y auth-glass-card absolute left-0 top-0 z-10 w-[72%] p-4">
        <p class="text-xs text-white/70">Agenda du jour</p>
        <p class="mt-1 text-2xl font-semibold text-white">12 RDV</p>
        <div class="mt-3 flex items-end gap-1.5">
          <div class="h-8 w-3 rounded-sm bg-primary-400/80" />
          <div class="h-12 w-3 rounded-sm bg-primary-300/80" />
          <div class="h-6 w-3 rounded-sm bg-white/30" />
          <div class="h-10 w-3 rounded-sm bg-primary-400/80" />
          <div class="h-14 w-3 rounded-sm bg-primary-200/90" />
        </div>
      </div>

      <div class="auth-float-x auth-glass-card absolute right-0 top-24 z-20 w-[68%] p-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-xs font-medium text-white">Prochains RDV</p>
          <IconUsers :size="16" :stroke-width="2" class="text-primary-200" />
        </div>
        <div class="space-y-2">
          <div
            v-for="appt in appointments"
            :key="appt.name"
            class="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"
          >
            <div>
              <p class="text-[11px] font-medium text-white">{{ appt.name }}</p>
              <p class="text-[10px] text-white/60">{{ appt.service }}</p>
            </div>
            <span class="text-[10px] text-primary-100">{{ appt.time }}</span>
          </div>
        </div>
      </div>

      <div
        class="auth-float-y auth-glass-card absolute bottom-8 left-8 z-10 w-[58%] p-4"
        style="animation-delay: 1s"
      >
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600/80">
            <IconCash :size="18" :stroke-width="2" class="text-white" />
          </div>
          <div>
            <p class="text-[10px] text-white/60">Recettes du jour</p>
            <p class="text-lg font-semibold text-white">42 500 F</p>
          </div>
        </div>
        <p class="mt-2 text-[10px] text-primary-200">+18% vs hier</p>
      </div>
    </div>

    <!-- Brand copy -->
    <div class="relative z-30 mx-auto w-full max-w-md text-center">
      <h2 class="text-xl font-semibold leading-snug text-white md:text-2xl">
        Un hub unifié pour gérer votre salon intelligemment
      </h2>
      <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/65">
        Agenda, Mobile Money, formulaire public et suivi de RDV — tout ce dont votre salon a besoin,
        au même endroit.
      </p>
      <div class="mt-6 flex items-center justify-center gap-2">
        <span class="h-1 w-6 rounded-full bg-white" />
        <span class="h-1 w-2 rounded-full bg-white/40" />
        <span class="h-1 w-2 rounded-full bg-white/40" />
      </div>
    </div>

    <IconCalendar
      class="pointer-events-none absolute -bottom-8 -right-8 text-white/[0.04]"
      :size="200"
      :stroke-width="1"
      aria-hidden="true"
    />
  </aside>
</template>
