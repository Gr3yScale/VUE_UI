<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { PollEntry } from '../../types'
import TaskResultCard from '../TaskResultCard.vue'

const props = defineProps<{
  taskId: string
  entries: PollEntry[]
  isPolling: boolean
  isStopped: boolean
  error: string | null
}>()

const emit = defineEmits<{
  cancel: []
  navigate: [page: string]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const isAtBottom = ref(true)

function onScroll(): void {
  if (!scrollContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 60
}

watch(
  () => props.entries.length,
  async () => {
    if (!isAtBottom.value) return
    await nextTick()
    scrollContainer.value?.scrollTo({ top: scrollContainer.value.scrollHeight, behavior: 'smooth' })
  },
)
</script>

<template>
  <div class="flex h-full flex-col gap-4 p-6">
    <!-- Header -->
    <div class="flex flex-shrink-0 items-start justify-between">
      <div>
        <button
          data-testid="viewer-back-btn"
          class="mb-1 text-xs text-compass-muted transition-colors hover:text-compass-accent"
          @click="emit('navigate', 'dashboard')"
        >
          ← Dashboard
        </button>
        <h2 class="font-mono text-sm font-semibold text-compass-heading break-all">{{ taskId }}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="isPolling" class="flex items-center gap-1.5 text-xs text-compass-muted">
          <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-compass-accent" />
          Polling…
        </span>
        <span v-else-if="isStopped" class="text-xs text-compass-muted">Stopped</span>
        <span v-else-if="!isPolling && entries.length > 0" class="text-xs text-compass-muted">Idle</span>
        <button
          v-if="isPolling"
          data-testid="viewer-cancel-btn"
          class="rounded border border-compass-error bg-transparent px-3 py-1.5 text-sm text-compass-error transition-colors hover:bg-red-900/20"
          @click="emit('cancel')"
        >
          Cancel task
        </button>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      data-testid="viewer-error"
      class="flex-shrink-0 rounded border border-compass-error bg-red-900/20 px-3 py-2 text-sm text-compass-error"
    >
      {{ error }}
    </div>

    <!-- Empty state -->
    <div
      v-if="entries.length === 0 && !isPolling && !error"
      class="flex flex-1 items-center justify-center text-sm text-compass-muted"
    >
      No poll results yet
    </div>

    <!-- Results list -->
    <div
      v-else-if="entries.length > 0"
      ref="scrollContainer"
      data-testid="viewer-results-list"
      class="flex flex-1 flex-col gap-3 overflow-y-auto"
      @scroll="onScroll"
    >
      <TaskResultCard
        v-for="(entry, i) in entries"
        :key="i"
        :entry="entry"
      />
    </div>
  </div>
</template>
