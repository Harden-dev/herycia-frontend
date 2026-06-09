<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppointmentsCardGrid from '@/components/appointments/AppointmentsCardGrid.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dmyToIso, isoToDMY } from '@/lib/utils'
import { useAppointmentsStore } from '@/stores/appointments'

const store = useAppointmentsStore()

const datePickerValue = computed({
  get: () => dmyToIso(store.date),
  set: (iso: string) => {
    if (iso) store.setDate(isoToDMY(iso))
  },
})

onMounted(() => store.load())

async function onStatus(id: string, status: Parameters<typeof store.setStatus>[1]) {
  await store.setStatus(id, status)
}

async function onCancel(id: string) {
  await store.cancel(id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppHeader
      title="Agenda"
      :description="`${store.items.length} rendez-vous — ${store.date}`"
    />

    <p v-if="store.error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ store.error }}
    </p>

    <div class="flex max-w-xs flex-col gap-2">
      <Label for="agenda-date">Date</Label>
      <Input
        id="agenda-date"
        v-model="datePickerValue"
        type="date"
        class="bg-card"
      />
    </div>

    <AppointmentsCardGrid
      :appointments="store.items"
      :loading="store.loading"
      @update-status="onStatus"
      @cancel="onCancel"
    />
  </div>
</template>
