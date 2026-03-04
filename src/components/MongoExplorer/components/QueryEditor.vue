<script setup lang="ts">
import type { JsonEditorState } from '../types'

defineProps<{
  filter: JsonEditorState
  sort: JsonEditorState
  projection: JsonEditorState
  canRun: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:filter': [raw: string]
  'update:sort': [raw: string]
  'update:projection': [raw: string]
  run: []
  reset: []
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-3 gap-3">
      <!-- Filter -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-compass-muted uppercase tracking-wider">
          Filter
        </label>
        <textarea
          :value="filter.raw"
          rows="4"
          spellcheck="false"
          placeholder='{ "status": "active" }'
          :class="[
            'w-full bg-compass-elevated border rounded px-3 py-2 text-sm font-mono text-compass-text placeholder-compass-muted resize-none focus:outline-none transition-colors',
            filter.isValid || filter.raw === '{}'
              ? 'border-compass-border focus:border-compass-accent'
              : 'border-compass-error focus:border-compass-error',
          ]"
          data-testid="query-editor-filter-input"
          @input="emit('update:filter', ($event.target as HTMLTextAreaElement).value)"
        />
        <span
          v-if="!filter.isValid"
          class="text-xs text-compass-error"
          data-testid="query-editor-filter-error"
        >
          {{ filter.error }}
        </span>
      </div>

      <!-- Sort -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-compass-muted uppercase tracking-wider">
          Sort
        </label>
        <textarea
          :value="sort.raw"
          rows="4"
          spellcheck="false"
          placeholder='{ "createdAt": -1 }'
          :class="[
            'w-full bg-compass-elevated border rounded px-3 py-2 text-sm font-mono text-compass-text placeholder-compass-muted resize-none focus:outline-none transition-colors',
            sort.isValid
              ? 'border-compass-border focus:border-compass-accent'
              : 'border-compass-error focus:border-compass-error',
          ]"
          data-testid="query-editor-sort-input"
          @input="emit('update:sort', ($event.target as HTMLTextAreaElement).value)"
        />
        <span
          v-if="!sort.isValid"
          class="text-xs text-compass-error"
          data-testid="query-editor-sort-error"
        >
          {{ sort.error }}
        </span>
      </div>

      <!-- Projection -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-compass-muted uppercase tracking-wider">
          Projection
        </label>
        <textarea
          :value="projection.raw"
          rows="4"
          spellcheck="false"
          placeholder='{ "name": 1, "email": 1 }'
          :class="[
            'w-full bg-compass-elevated border rounded px-3 py-2 text-sm font-mono text-compass-text placeholder-compass-muted resize-none focus:outline-none transition-colors',
            projection.isValid
              ? 'border-compass-border focus:border-compass-accent'
              : 'border-compass-error focus:border-compass-error',
          ]"
          data-testid="query-editor-projection-input"
          @input="emit('update:projection', ($event.target as HTMLTextAreaElement).value)"
        />
        <span
          v-if="!projection.isValid"
          class="text-xs text-compass-error"
          data-testid="query-editor-projection-error"
        >
          {{ projection.error }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        :disabled="!canRun || isLoading"
        class="px-4 py-1.5 rounded text-sm font-medium transition-colors bg-compass-accent text-compass-bg hover:bg-compass-accentHover disabled:opacity-40 disabled:cursor-not-allowed"
        data-testid="query-editor-run-btn"
        @click="emit('run')"
      >
        <span v-if="isLoading">Running…</span>
        <span v-else>Run Query</span>
      </button>
      <button
        class="px-4 py-1.5 rounded text-sm font-medium transition-colors border border-compass-border text-compass-muted hover:text-compass-text hover:border-compass-text"
        data-testid="query-editor-reset-btn"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>
  </div>
</template>
