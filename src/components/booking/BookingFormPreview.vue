<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IconCalendar, IconCheck, IconClock, IconScissors } from '@tabler/icons-vue'

const STEPS = ['service', 'stylist', 'slot', 'contact', 'confirm', 'done'] as const
type DemoStep = (typeof STEPS)[number]

const step = ref<DemoStep>('service')
const stepIndex = ref(0)
const typedName = ref('')
const typedPhone = ref('')

const demoServices = [
  { name: 'Coupe homme', price: '5 000 F' },
  { name: 'Coloration', price: '15 000 F' },
  { name: 'Brushing', price: '8 000 F' },
]

const demoStylists = ['Sarah', 'Marc', 'Julie']
const selectedService = 1
const selectedStylist = 1

const STEP_MS = 2200
const TYPING_MS = 45

let timer: ReturnType<typeof setInterval> | null = null
let typingTimer: ReturnType<typeof setInterval> | null = null

const fullName = 'Michel K.'
const fullPhone = '07 48 75 49 18'

function clearTyping() {
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
}

function animateTyping() {
  clearTyping()
  typedName.value = ''
  typedPhone.value = ''
  let nameIdx = 0
  let phoneIdx = 0
  let phase: 'name' | 'phone' | 'done' = 'name'

  typingTimer = setInterval(() => {
    if (phase === 'name') {
      nameIdx += 1
      typedName.value = fullName.slice(0, nameIdx)
      if (nameIdx >= fullName.length) phase = 'phone'
    } else if (phase === 'phone') {
      phoneIdx += 1
      typedPhone.value = fullPhone.slice(0, phoneIdx)
      if (phoneIdx >= fullPhone.length) {
        phase = 'done'
        clearTyping()
      }
    }
  }, TYPING_MS)
}

function goToStep(index: number) {
  stepIndex.value = index
  step.value = STEPS[index] ?? 'service'

  if (step.value === 'contact') animateTyping()
  else {
    clearTyping()
    if (step.value === 'confirm' || step.value === 'done') {
      typedName.value = fullName
      typedPhone.value = fullPhone
    } else {
      typedName.value = ''
      typedPhone.value = ''
    }
  }
}

function nextStep() {
  goToStep((stepIndex.value + 1) % STEPS.length)
}

onMounted(() => {
  goToStep(0)
  timer = setInterval(nextStep, STEP_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  clearTyping()
})

function isStepActive(key: DemoStep) {
  const idx = STEPS.indexOf(key)
  return idx <= stepIndex.value
}

function isStepCurrent(key: DemoStep) {
  return step.value === key
}
</script>

<template>
  <div class="booking-demo-wrap booking-fade-up booking-fade-up-delay-3 w-full" aria-hidden="true">
    <p class="mb-3 text-xs font-medium uppercase tracking-widest text-primary-200/70">
      Aperçu animé
    </p>

    <div class="booking-demo-card booking-demo-float">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div class="flex gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span class="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span class="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <span class="text-[10px] font-medium text-primary-100/60">herycia.ci/booking</span>
      </div>

      <!-- Stepper vertical pills -->
      <div class="flex gap-1 border-b border-white/10 px-4 py-3">
        <div
          v-for="(s, i) in STEPS.slice(0, 5)"
          :key="s"
          class="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
        >
          <div
            class="booking-demo-progress h-full rounded-full bg-primary-300"
            :style="{ width: i < stepIndex ? '100%' : i === stepIndex ? '55%' : '0%' }"
          />
        </div>
      </div>

      <div class="space-y-3 p-4">
        <!-- Service -->
        <div
          class="booking-demo-section rounded-xl p-3 transition-all duration-400"
          :class="isStepCurrent('service') && 'booking-demo-section--active'"
        >
          <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-primary-100/50">
            1 · Service
          </p>
          <div class="grid grid-cols-3 gap-1.5">
            <div
              v-for="(svc, i) in demoServices"
              :key="svc.name"
              class="rounded-lg border px-2 py-2 transition-all duration-300"
              :class="
                i === selectedService && isStepActive('service')
                  ? 'booking-demo-chip-selected border-primary-300 bg-primary-500/25'
                  : 'border-white/10 bg-white/5'
              "
            >
              <p class="truncate text-[10px] font-medium text-white">{{ svc.name }}</p>
              <p class="text-[9px] text-primary-200/70">{{ svc.price }}</p>
            </div>
          </div>
        </div>

        <!-- Coiffeur -->
        <div
          class="booking-demo-section rounded-xl p-3 transition-all duration-400"
          :class="isStepCurrent('stylist') && 'booking-demo-section--active'"
        >
          <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-primary-100/50">
            2 · Coiffeur
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="(name, i) in demoStylists"
              :key="name"
              class="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-300"
              :class="
                i === selectedStylist && isStepActive('stylist')
                  ? 'booking-demo-chip-selected border-primary-300 bg-primary-600 text-white'
                  : 'border-white/10 bg-white/5 text-primary-100/80'
              "
            >
              {{ name }}
            </span>
          </div>
        </div>

        <!-- Créneau -->
        <div
          class="booking-demo-section rounded-xl p-3 transition-all duration-400"
          :class="isStepCurrent('slot') && 'booking-demo-section--active'"
        >
          <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-primary-100/50">
            3 · Date & heure
          </p>
          <div class="flex gap-2">
            <div
              class="flex flex-1 items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-all duration-300"
              :class="
                isStepActive('slot')
                  ? 'booking-demo-chip-selected border-primary-300 bg-white/10'
                  : 'border-white/10 bg-white/5'
              "
            >
              <IconCalendar :size="12" class="text-primary-200" />
              <span class="text-[10px] text-white">24 mai 2026</span>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-all duration-300"
              :class="
                isStepActive('slot')
                  ? 'booking-demo-chip-selected border-primary-300 bg-white/10'
                  : 'border-white/10 bg-white/5'
              "
            >
              <IconClock :size="12" class="text-primary-200" />
              <span class="text-[10px] text-white">14:30</span>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div
          class="booking-demo-section rounded-xl p-3 transition-all duration-400"
          :class="isStepCurrent('contact') && 'booking-demo-section--active'"
        >
          <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-primary-100/50">
            4 · Coordonnées
          </p>
          <div class="space-y-1.5">
            <div class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
              <span class="text-[10px] text-white">
                {{ typedName || ' ' }}
                <span
                  v-if="isStepCurrent('contact') && typedName.length < fullName.length"
                  class="booking-demo-cursor"
                />
              </span>
            </div>
            <div class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
              <span class="text-[10px] text-white">
                {{ typedPhone || ' ' }}
                <span
                  v-if="
                    isStepCurrent('contact') &&
                    typedName.length >= fullName.length &&
                    typedPhone.length < fullPhone.length
                  "
                  class="booking-demo-cursor"
                />
              </span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div
          class="flex items-center justify-center rounded-xl py-2.5 text-[11px] font-semibold transition-all duration-400"
          :class="[
            isStepCurrent('confirm') || isStepCurrent('done')
              ? 'booking-demo-btn-active bg-primary-500 text-white'
              : 'bg-white/10 text-primary-100/50',
            isStepCurrent('confirm') && 'booking-demo-btn-pulse',
          ]"
        >
          <IconCheck v-if="isStepCurrent('done')" :size="14" class="mr-1.5" />
          <IconScissors v-else :size="14" class="mr-1.5" />
          {{ isStepCurrent('done') ? 'Rendez-vous confirmé' : 'Confirmer le rendez-vous' }}
        </div>
      </div>
    </div>
  </div>
</template>
