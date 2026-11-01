<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconClockHour4 } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from '@/lib/toast'
import { updateSalon } from '@/services/salon.service'
import type { SalonDetail } from '@/types/salon'

/** Retard toléré avant que le client doive choisir : passer après le dernier ou revenir un autre jour. */
const props = defineProps<{ minutes: number }>()
const emit = defineEmits<{ saved: [salon: SalonDetail] }>()

const PRESETS = [0, 5, 10, 15, 20, 30] as const

const value = ref(props.minutes)
const saved = ref(props.minutes)
const saving = ref(false)

watch(
  () => props.minutes,
  (minutes) => {
    value.value = minutes
    saved.value = minutes
  },
)

const isPreset = computed(() => (PRESETS as readonly number[]).includes(value.value))

function onCustomInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  value.value = raw === '' ? saved.value : Number(raw)
}

const valid = computed(() => Number.isInteger(value.value) && value.value >= 0 && value.value <= 60)
const dirty = computed(() => value.value !== saved.value)

/** Exemple concret : rendez-vous à 10:00. */
const example = computed(() => {
  if (!valid.value) return null
  if (value.value === 0) return 'Rendez-vous à 10:00 : à partir de 10:01, le client doit choisir.'
  const limit = `10:${String(value.value).padStart(2, '0')}`
  return value.value === 60
    ? 'Rendez-vous à 10:00 : arrivée acceptée jusqu’à 11:00.'
    : `Rendez-vous à 10:00 : arrivée acceptée jusqu’à ${limit}.`
})

async function save() {
  if (!valid.value || !dirty.value) return
  saving.value = true
  try {
    const response = await updateSalon({ late_tolerance_minutes: value.value })
    saved.value = value.value
    emit('saved', response.data)
    toast.success('Tolérance de retard enregistrée')
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form
    class="rounded-xl border border-border bg-card p-5"
    data-testid="late-tolerance-card"
    @submit.prevent="save"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-800"
      >
        <IconClockHour4 :size="20" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold text-foreground">Retard toléré</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Au-delà, le client choisit : passer après le dernier de la liste ou revenir un autre
          jour à la même heure.
        </p>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Retard toléré en minutes">
          <button
            v-for="preset in PRESETS"
            :key="preset"
            type="button"
            role="radio"
            :aria-checked="value === preset"
            class="h-9 min-w-14 cursor-pointer rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="
              value === preset
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-border bg-card text-foreground hover:border-primary-400'
            "
            @click="value = preset"
          >
            {{ preset }} min
          </button>
          <label
            class="flex h-9 items-center gap-1 rounded-lg border pl-2 pr-2 text-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
            :class="isPreset ? 'border-border bg-card' : 'border-primary-600 bg-primary-50'"
          >
            <span class="sr-only">Autre durée</span>
            <input
              :value="isPreset ? '' : value"
              type="number"
              placeholder="Autre"
              min="0"
              max="60"
              step="1"
              class="w-12 bg-transparent text-right outline-none placeholder:text-muted-foreground"
              aria-label="Retard toléré personnalisé, en minutes"
              @input="onCustomInput"
            />
            <span class="text-muted-foreground">min</span>
          </label>
        </div>
        <p v-if="example" class="text-xs text-muted-foreground">{{ example }}</p>
        <p v-else class="text-xs text-danger-800">Choisissez une durée entre 0 et 60 minutes.</p>
      </div>

      <Button
        type="submit"
        class="cursor-pointer bg-primary-600 hover:bg-primary-800"
        :disabled="saving || !valid || !dirty"
      >
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </Button>
    </div>
  </form>
</template>
