<script setup lang="ts">
import type { Component } from 'vue'
import { IconCheck } from '@tabler/icons-vue'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Carte « QR code » des paramètres : même anatomie pour les deux QR du salon
 * (réservation et arrivée) afin que l'on comprenne d'un coup d'œil lequel sert à quoi.
 */
withDefaults(
  defineProps<{
    icon: Component
    /** Moment d'usage, affiché en pastille : « Avant la visite », « Au salon »… */
    moment: string
    title: string
    description: string
    /** Où afficher ou partager ce QR. */
    usages: string[]
    qrSrc?: string | null
    qrAlt: string
    loading?: boolean
    error?: string | null
    tone?: 'primary' | 'neutral'
  }>(),
  { qrSrc: null, loading: false, error: null, tone: 'primary' },
)
</script>

<template>
  <section class="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card">
    <header class="flex items-start gap-3 p-5 pb-4">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        :class="tone === 'primary' ? 'bg-primary-100 text-primary-800' : 'bg-foreground text-background'"
      >
        <component :is="icon" :size="20" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-base font-semibold text-foreground">{{ title }}</h3>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="
              tone === 'primary'
                ? 'bg-primary-50 text-primary-800'
                : 'bg-secondary text-foreground'
            "
          >
            {{ moment }}
          </span>
        </div>
        <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
      </div>
    </header>

    <div class="flex flex-1 flex-col gap-5 px-5 pb-5 sm:flex-row sm:items-start">
      <div
        class="flex shrink-0 justify-center rounded-xl border p-3 sm:w-[184px]"
        :class="tone === 'primary' ? 'border-primary-200 bg-primary-50/60' : 'border-border bg-secondary/60'"
      >
        <Skeleton v-if="loading" class="aspect-square w-full max-w-[160px] rounded-lg" />
        <img
          v-else-if="qrSrc"
          :src="qrSrc"
          :alt="qrAlt"
          width="160"
          height="160"
          class="aspect-square w-full max-w-[160px] rounded-lg bg-white p-1.5 shadow-sm"
        />
        <p
          v-else
          class="flex aspect-square w-full max-w-[160px] items-center justify-center px-2 text-center text-xs text-muted-foreground"
        >
          {{ error ?? 'QR temporairement indisponible.' }}
        </p>
      </div>

      <div class="min-w-0 flex-1 space-y-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Où l’utiliser
          </p>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="usage in usages"
              :key="usage"
              class="flex items-start gap-2 text-sm text-foreground"
            >
              <IconCheck :size="16" class="mt-0.5 shrink-0 text-success-600" />
              {{ usage }}
            </li>
          </ul>
        </div>
        <slot name="details" />
      </div>
    </div>

    <footer class="mt-auto flex flex-col gap-2 border-t border-border p-4 sm:flex-row sm:items-center">
      <slot name="actions" />
    </footer>
  </section>
</template>
