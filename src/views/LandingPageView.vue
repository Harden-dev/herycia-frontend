<script setup lang="ts">
import '@/assets/landing.css'
import CtaSection from '@/components/landing/CtaSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import ProblemSection from '@/components/landing/ProblemSection.vue'
import PublicBookingSection from '@/components/landing/PublicBookingSection.vue'
import StatsBar from '@/components/landing/StatsBar.vue'
</script>

<template>
  <div class="landing-page min-h-screen bg-background">
    <LandingNavbar />
    <main>
      <HeroSection />
      <PublicBookingSection />
      <StatsBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
    </main>
    <LandingFooter />
  </div>
</template>
