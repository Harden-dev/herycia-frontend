<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const adminStore = useAdminStore()
const mainRef = ref<HTMLElement | null>(null)

onMounted(() => {
  adminStore.loadProfile()
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    mainRef.value?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-secondary">
    <AdminSidebar class="hidden w-64 shrink-0 lg:flex" />
    <main ref="mainRef" class="flex-1 overflow-y-auto">
      <div class="p-4 md:p-6 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
