<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline' | 'inverse' | 'ghost'
    block?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    variant: 'primary',
    block: false,
  },
)

/** Même rayon que les boutons de l'application ; seule la couleur change au survol. */
const baseClasses = 'h-11 rounded-lg px-5 text-[15px] font-medium shadow-none transition-colors'

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-800 [&_svg]:text-white',
  outline: 'border border-border bg-card text-foreground hover:bg-secondary',
  inverse: 'bg-white text-foreground hover:bg-primary-50',
  ghost: 'h-9 px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground',
}

const shadcnVariant = {
  primary: 'default',
  outline: 'outline',
  inverse: 'default',
  ghost: 'ghost',
} as const
</script>

<template>
  <Button
    :variant="shadcnVariant[variant]"
    :class="cn(baseClasses, variantClasses[variant], block && 'w-full', props.class)"
    as-child
  >
    <slot />
  </Button>
</template>
