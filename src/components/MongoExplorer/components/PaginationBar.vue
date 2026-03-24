<script setup lang="ts">
defineProps<{
  summary: string
  hasPrev: boolean
  hasNext: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-2 border-b border-compass-border bg-compass-surface text-sm"
  >
    <button
      :disabled="!hasPrev || isLoading"
      class="flex items-center gap-1 px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      data-testid="pagination-prev-btn"
      @click="emit('prev')"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Prev
    </button>

    <span class="text-compass-muted font-mono text-xs" data-testid="pagination-summary">
      {{ summary }}
    </span>

    <button
      :disabled="!hasNext || isLoading"
      class="flex items-center gap-1 px-3 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      data-testid="pagination-next-btn"
      @click="emit('next')"
    >
      Next
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>
