<script setup lang="ts">
import '@/assets/landing.css'
import { MotionConfig } from 'motion-v'
import CtaSection from '@/components/landing/CtaSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import JourneySection from '@/components/landing/JourneySection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import ManifestoSection from '@/components/landing/ManifestoSection.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import QueueSection from '@/components/landing/QueueSection.vue'
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="landing-page min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ManifestoSection />
        <JourneySection />
        <QueueSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  </MotionConfig>
</template>
