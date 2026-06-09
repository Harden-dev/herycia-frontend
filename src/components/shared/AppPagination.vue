<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { PaginationEllipsis, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { getPaginationPages } from '@/lib/pagination'
import type { PaginationMeta } from '@/types/api'

const props = defineProps<{
  pagination: PaginationMeta
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() =>
  getPaginationPages(props.pagination.current_page, props.pagination.last_page),
)

function goTo(page: number) {
  if (page < 1 || page > props.pagination.last_page) return
  if (page === props.pagination.current_page) return
  emit('update:page', page)
}
</script>

<template>
  <nav class="mx-auto flex w-full justify-center" aria-label="Pagination">
    <div class="flex flex-row items-center gap-1">
      <PaginationPrevious
        :disabled="pagination.current_page <= 1"
        @click="goTo(pagination.current_page - 1)"
      />

      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <PaginationEllipsis v-if="item === 'ellipsis'" />
        <Button
          v-else
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          :class="
            item === pagination.current_page &&
            'border border-primary-600 bg-primary-50 text-primary-800 hover:bg-primary-50'
          "
          @click="goTo(item)"
        >
          {{ item }}
        </Button>
      </template>

      <PaginationNext
        :disabled="pagination.current_page >= pagination.last_page"
        @click="goTo(pagination.current_page + 1)"
      />
    </div>
  </nav>
</template>
