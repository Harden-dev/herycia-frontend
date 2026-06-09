<script setup lang="ts">
import HeryciaLogo from '@/components/brand/HeryciaLogo.vue'
</script>

<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-6 md:px-10"
  >
    <HeryciaLogo size="xs" />
    <p class="text-xs text-muted-foreground">
      Conçu pour les salons de Côte d'Ivoire · {{ new Date().getFullYear() }}
    </p>
  </footer>
</template>
