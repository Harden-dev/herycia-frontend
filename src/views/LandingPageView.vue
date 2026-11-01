<script setup lang="ts">
import '@/assets/landing.css'
import { ref } from 'vue'
import { MotionConfig } from 'motion-v'
import CtaSection from '@/components/landing/CtaSection.vue'
import FeatureMarquee from '@/components/landing/FeatureMarquee.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import JourneySection from '@/components/landing/JourneySection.vue'
import LandingCursor from '@/components/landing/LandingCursor.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import ManifestoSection from '@/components/landing/ManifestoSection.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import QueueSection from '@/components/landing/QueueSection.vue'

const customCursor = ref(false)
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="landing-page min-h-screen" :class="customCursor && 'has-cursor'">
      <LandingCursor @active="customCursor = $event" />
      <LandingNavbar />
      <main>
        <HeroSection />
        <ManifestoSection />
        <JourneySection />
        <QueueSection />
        <FeatureMarquee />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  </MotionConfig>
</template>
