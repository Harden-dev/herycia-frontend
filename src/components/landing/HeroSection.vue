<script setup lang="ts">
import { IconArrowRight, IconClipboardList, IconTrendingUp } from '@tabler/icons-vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LandingButton from '@/components/landing/LandingButton.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const metrics = [
  { label: "RDV aujourd'hui", value: '12', trend: '+3' },
  { label: 'En attente', value: '3', trend: null },
  { label: 'Recettes', value: '42 500 F', trend: '+18%' },
]

const appointments = [
  {
    initials: 'NL',
    name: "N'zuo Lucrece",
    service: 'Coupe homme',
    time: '10h00',
    status: 'confirmed',
    avatarClass: 'bg-primary-50 text-primary-800',
  },
  {
    initials: 'LS',
    name: 'Lauryn Semi',
    service: 'Tresse',
    time: '11h30',
    status: 'pending',
    avatarClass: 'bg-warning-50 text-warning-800',
  },
  {
    initials: 'NA',
    name: 'Nadège Ablan',
    service: 'Coloration',
    time: '14h00',
    status: 'confirmed',
    avatarClass: 'bg-accent-50 text-accent-800',
  },
]

const navItems = ['Dashboard', 'Agenda', 'File', 'Clients']
</script>

<template>
  <section class="landing-hero">
    <div class="landing-hero-glow" aria-hidden="true" />

    <div class="landing-hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hero-wave-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#9a6f09" stop-opacity="0.12" />
            <stop offset="50%" stop-color="#d4a017" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#b8860b" stop-opacity="0.1" />
          </linearGradient>
          <linearGradient id="hero-wave-dark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#18181b" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0.07" />
          </linearGradient>
        </defs>
        <path
          class="wave-soft"
          fill="url(#hero-wave-dark)"
          d="M0,96 C240,160 480,32 720,96 C960,160 1200,32 1440,96 L1440,220 L0,220 Z"
        />
        <path
          class="wave-gold"
          fill="url(#hero-wave-gold)"
          d="M0,128 C320,200 640,56 960,128 C1120,168 1280,104 1440,128 L1440,220 L0,220 Z"
        />
        <path
          fill="#fff"
          fill-opacity="0.65"
          d="M0,168 C360,220 720,120 1080,168 C1260,192 1380,176 1440,168 L1440,220 L0,220 Z"
        />
      </svg>
    </div>

    <div
      class="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-16"
    >
      <!-- Copy -->
      <ScrollReveal direction="left" class="text-left">
        <div>
          <span
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50 px-3.5 py-1.5 text-xs font-medium text-primary-800"
          >
            <IconClipboardList :size="14" :stroke-width="LANDING_ICON_STROKE" />
            Formulaire public de réservation
          </span>

          <h1
            class="text-[48px] font-extrabold leading-[1.13] tracking-tight text-foreground md:text-[60px]"
          >
            Gérez votre salon
            <span class="text-primary-600">comme un pro</span>
          </h1>

          <p class="mt-5 max-w-md text-[16px] leading-relaxed text-muted-foreground">
            Agenda, paiements Mobile Money, formulaire et suivi de RDV en ligne — tout en un.
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <LandingButton variant="primary">
              <RouterLink to="/register" class="inline-flex items-center gap-2 text-white">
                <IconArrowRight :size="18" :stroke-width="LANDING_ICON_STROKE" class="text-white" />
                Essayer 7 jours
              </RouterLink>
            </LandingButton>
            <LandingButton variant="outline">
              <a href="#reservation" class="inline-flex items-center text-primary-700">
                Voir comment ça marche
              </a>
            </LandingButton>
          </div>

          <p class="mt-4 text-xs text-muted-foreground">
            7 jours d'essai · Aucune carte bancaire requise
          </p>
        </div>
      </ScrollReveal>

      <!-- Dashboard preview -->
      <ScrollReveal
        direction="right"
        :delay="120"
        class="relative mx-auto w-full max-w-lg rounded-2xl shadow-[0_20px_56px_rgb(184_134_11_/_0.18)] lg:mx-0 lg:max-w-none"
      >
        <!-- Floating notification — up / down -->
        <div
          class="landing-float-y absolute -left-4 top-8 z-10 hidden landing-card-flat p-3 md:block lg:-left-8"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-success-50 text-success-700"
            >
              <IconClipboardList :size="16" :stroke-width="LANDING_ICON_STROKE" />
            </div>
            <div>
              <p class="text-xs font-medium text-foreground">Nouveau RDV</p>
              <p class="text-[11px] text-muted-foreground">via formulaire · il y a 2 min</p>
            </div>
          </div>
        </div>

        <!-- Floating stat — left / right -->
        <div
          class="landing-float-x absolute -right-2 bottom-20 z-10 hidden landing-card-flat border-primary-200/60 bg-primary-50 px-3 py-2 md:block lg:-right-6"
        >
          <div class="flex items-center gap-1.5 text-primary-700">
            <IconTrendingUp :size="14" :stroke-width="LANDING_ICON_STROKE" />
            <p class="text-xs font-medium text-primary-700">+18% recettes ce mois</p>
          </div>
        </div>

        <!-- Browser frame — léger balancement vertical -->
        <div class="landing-float-y-slow landing-card-elevated overflow-hidden !rounded-2xl">
          <!-- Chrome bar -->
          <div class="flex items-center gap-3 border-b border-border bg-secondary px-4 py-2.5">
            <div class="flex gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-danger-600/40" />
              <span class="h-2.5 w-2.5 rounded-full bg-warning-600/40" />
              <span class="h-2.5 w-2.5 rounded-full bg-primary-400/60" />
            </div>
            <div
              class="flex-1 rounded-md bg-card px-3 py-1 text-center text-[11px] text-muted-foreground"
            >
              app.herycia.ci/dashboard
            </div>
          </div>

          <div class="flex">
            <!-- Mini sidebar -->
            <div
              class="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-3 sm:flex"
            >
              <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
                <span class="text-[10px] text-white">S</span>
              </div>
              <div
                v-for="(item, i) in navItems"
                :key="item"
                class="flex h-8 w-8 items-center justify-center rounded-md text-[9px] text-muted-foreground"
                :class="i === 0 ? 'bg-primary-50 text-primary-800' : ''"
              >
                {{ item.slice(0, 1) }}
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 bg-secondary p-4">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-xs font-medium text-foreground"> Salon Koffi Cocody </span>
                <span
                  class="landing-float-x-slow rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-800"
                >
                  En ligne
                </span>
              </div>

              <div class="mb-3 grid grid-cols-3 gap-2">
                <div
                  v-for="(metric, index) in metrics"
                  :key="metric.label"
                  class="landing-card-flat p-2.5 !rounded-lg !shadow-none"
                  :class="
                    index === 1 ? 'landing-float-y' : index === 2 ? 'landing-float-x-slow' : ''
                  "
                  :style="
                    index === 1
                      ? { animationDelay: '0.6s' }
                      : index === 2
                        ? { animationDelay: '1.4s' }
                        : undefined
                  "
                >
                  <p class="text-[10px] text-muted-foreground">{{ metric.label }}</p>
                  <p class="text-lg font-medium text-foreground">{{ metric.value }}</p>
                  <p v-if="metric.trend" class="text-[10px] text-success-600">
                    {{ metric.trend }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <div
                  v-for="(appt, index) in appointments"
                  :key="appt.name"
                  class="landing-card-flat flex items-center justify-between px-3 py-2 !rounded-lg !shadow-none"
                  :class="
                    index === 0 ? 'landing-float-x-slow' : index === 1 ? 'landing-float-y' : ''
                  "
                  :style="
                    index === 0
                      ? { animationDelay: '0.2s' }
                      : index === 1
                        ? { animationDelay: '1.8s', animationDuration: '5.5s' }
                        : undefined
                  "
                >
                  <div class="flex items-center gap-2">
                    <Avatar class="h-7 w-7">
                      <AvatarFallback :class="appt.avatarClass" class="text-[10px] font-medium">
                        {{ appt.initials }}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="text-[11px] font-medium text-foreground">
                        {{ appt.name }}
                      </p>
                      <p class="text-[10px] text-muted-foreground">
                        {{ appt.service }} · {{ appt.time }}
                      </p>
                    </div>
                  </div>
                  <StatusBadge :status="appt.status" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
