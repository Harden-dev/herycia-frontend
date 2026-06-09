<script setup lang="ts">
import type { Component } from 'vue'
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { IconEye, IconEyeOff } from '@tabler/icons-vue'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    type?: string
    placeholder?: string
    required?: boolean
    icon: Component
    modelValue?: string
    error?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    type: 'text',
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label :for="id" class="text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-primary-600">*</span>
    </Label>
    <div class="relative">
      <component
        :is="icon"
        :size="18"
        :stroke-width="2"
        class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        :id="id"
        :type="type === 'password' ? (showPassword ? 'text' : 'password') : type"
        :placeholder="placeholder"
        :required="required"
        :value="modelValue"
        :class="
          cn(
            'auth-input w-full outline-none',
            error && 'border-danger-500 focus-visible:ring-danger-500/30',
            props.class,
          )
        "
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        @input="onInput"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        <IconEyeOff v-if="showPassword" :size="18" :stroke-width="2" />
        <IconEye v-else :size="18" :stroke-width="2" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="text-xs text-danger-600">{{ error }}</p>
  </div>
</template>
