<script setup lang="ts">
import { IconChevronRight } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<{
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    class="h-9 w-9"
    :class="cn(props.class)"
    :disabled="disabled"
    aria-label="Page suivante"
    @click="emit('click')"
  >
    <IconChevronRight :size="16" :stroke-width="2" />
  </Button>
</template>
