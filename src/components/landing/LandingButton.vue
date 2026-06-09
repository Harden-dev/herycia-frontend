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

const baseClasses =
  'min-h-12 rounded-full px-8 text-[15px] font-medium shadow-none transition-all duration-150'

const variantClasses = {
  primary:
    'h-12 border border-primary-700 bg-primary-600 text-white hover:border-primary-800 hover:bg-primary-800 [&_svg]:text-white',
  outline:
    'h-12 border border-primary-600/30 bg-white text-primary-700 hover:border-primary-600 hover:bg-primary-50/60',
  inverse:
    'h-12 border border-white/30 bg-white text-primary-800 hover:border-white hover:bg-primary-50 [&_svg]:text-primary-800',
  ghost:
    'h-10 min-h-10 border border-primary-600/30 bg-transparent px-5 text-[13px] text-muted-foreground hover:border-primary-600 hover:bg-primary-50/60 hover:text-primary-700',
}

const shadcnVariant = {
  primary: 'default',
  outline: 'outline',
  inverse: 'default',
  ghost: 'outline',
} as const
</script>

<template>
  <Button
    :variant="shadcnVariant[variant]"
    :class="
      cn(
        baseClasses,
        variantClasses[variant],
        block && 'w-full',
        props.class,
      )
    "
    as-child
  >
    <slot />
  </Button>
</template>
