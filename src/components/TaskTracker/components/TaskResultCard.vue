<script setup lang="ts">
import type { PollEntry } from '../types'

defineProps<{
  entry: PollEntry
}>()

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
</script>

<template>
  <div
    class="rounded border border-compass-border bg-compass-elevated p-3 font-mono text-sm"
    :data-testid="`task-result-card-${entry.timestamp}`"
  >
    <div class="mb-2 flex items-center gap-2">
      <span class="text-xs text-compass-muted">{{ entry.timestamp }}</span>
      <span class="rounded bg-compass-surface px-1.5 py-0.5 text-xs text-compass-accent">
        +{{ formatElapsed(entry.elapsedMs) }}
      </span>
      <span
        v-if="entry.data.status"
        class="rounded px-1.5 py-0.5 text-xs font-medium"
        :class="{
          'bg-green-900/40 text-green-400': entry.data.status === 'COMPLETED',
          'bg-red-900/40 text-red-400': entry.data.status === 'FAILED' || entry.data.status === 'ERROR',
          'bg-yellow-900/40 text-yellow-400': entry.data.status === 'RUNNING',
          'bg-compass-surface text-compass-muted': entry.data.status === 'STOPPED' || entry.data.status === 'CANCELLED',
        }"
      >
        {{ entry.data.status }}
      </span>
    </div>
    <pre class="overflow-x-auto whitespace-pre-wrap break-words text-compass-text">{{ JSON.stringify(entry.data, null, 2) }}</pre>
  </div>
</template>
