<script setup lang="ts">
import '@/assets/landing.css'
import { MotionConfig } from 'motion-v'
import CtaSection from '@/components/landing/CtaSection.vue'
import FeatureMarquee from '@/components/landing/FeatureMarquee.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import PublicBookingSection from '@/components/landing/PublicBookingSection.vue'
import QueueSection from '@/components/landing/QueueSection.vue'
</script>

<template>
  <MotionConfig reduced-motion="user">
  <div class="landing-page min-h-screen bg-background">
    <LandingNavbar />
    <main>
      <HeroSection />
      <FeatureMarquee />
      <PublicBookingSection />
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
