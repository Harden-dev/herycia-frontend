<script setup lang="ts">
import { ref } from 'vue'
import { motion, useScroll, useTransform } from 'motion-v'
import { IconScissors } from '@tabler/icons-vue'

/**
 * Manifeste : les mots s'éclairent un à un au fil du défilement,
 * des ciseaux géants tournent lentement en filigrane.
 */
const sectionRef = ref<HTMLElement | null>(null)
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.85', 'end 0.6'] })

const statement = 'Les appels pendant une coupe. Les clients qui attendent sans savoir. Les rendez-vous oubliés.'
const accent = 'Votre salon mérite mieux qu’un carnet et un téléphone.'

const words = [...statement.split(' '), ...accent.split(' ')].map((text, index, all) => {
  const start = (index / all.length) * 0.85
  return {
    text,
    accent: index >= statement.split(' ').length,
    opacity: useTransform(scrollYProgress, [start, start + 0.12], [0.14, 1]),
  }
})
const firstAccent = statement.split(' ').length

const rotate = useTransform(scrollYProgress, [0, 1], [-20, 70])
</script>

<template>
  <section
    ref="sectionRef"
    class="landing-dark landing-grain overflow-hidden px-4 pb-10 pt-24 md:px-10 md:pb-16 md:pt-36"
    aria-label="Pourquoi Herycia"
  >
    <motion.div
      class="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 text-white/[0.04] md:right-0"
      :style="{ rotate }"
      aria-hidden="true"
    >
      <IconScissors :size="560" :stroke-width="1.2" />
    </motion.div>

    <div class="relative mx-auto max-w-6xl">
      <p class="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-primary-400">Manifeste</p>
      <p
        class="max-w-4xl text-[30px] font-semibold uppercase leading-[1.15] tracking-tight md:text-[52px]"
      >
        <template v-for="(word, index) in words" :key="index">
          <br v-if="index === firstAccent" />
          <motion.span
            :style="{ opacity: word.opacity }"
            :class="
              word.accent
                ? 'landing-serif mt-3 inline-block text-[1.15em] leading-[1.05] text-primary-300'
                : 'inline-block'
            "
            >{{ word.text }}</motion.span
          >{{ ' ' }}
        </template>
      </p>
    </div>
  </section>
</template>
