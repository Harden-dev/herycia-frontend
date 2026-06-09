<script setup lang="ts">
import { computed } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
  <Pagination :items-per-page="pagination.per_page" :total="pagination.total_rows">
    <PaginationContent>
      <PaginationItem :value="pagination.current_page - 1">
        <PaginationPrevious
          :disabled="pagination.current_page <= 1"
          @click="goTo(pagination.current_page - 1)"
        />
      </PaginationItem>

      <PaginationItem
        v-for="(item, index) in pages"
        :key="`${item}-${index}`"
        :value="item as unknown as number"
      >
        <PaginationEllipsis v-if="item === 'ellipsis'" />
        <PaginationItem
          v-else
          :value="item as unknown as number"
          :is-active="item === pagination.current_page"
          @click="goTo(item)"
        >
          {{ item }}
        </PaginationItem>
      </PaginationItem>

      <PaginationItem :value="pagination.current_page + 1">
        <PaginationNext
          :disabled="pagination.current_page >= pagination.last_page"
          @click="goTo(pagination.current_page + 1)"
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
</template>
