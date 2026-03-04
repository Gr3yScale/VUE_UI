<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import type { SqlSampleQuery } from '../types'

const props = defineProps<{
  visible: boolean
  queries: SqlSampleQuery[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  close: []
  apply: [query: SqlSampleQuery]
}>()

const activeId = ref<string | null>(props.selectedId)

const activeQuery = computed(() =>
  props.queries.find(q => q.id === activeId.value) ?? props.queries[0] ?? null,
)

function select(q: SqlSampleQuery): void {
  activeId.value = q.id
}

function apply(): void {
  if (activeQuery.value) {
    emit('apply', activeQuery.value)
  }
}

function descriptionHtml(q: SqlSampleQuery): string {
  return marked.parse(q.description) as string
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-40 bg-black/50"
      @click.self="emit('close')"
    />
    <div
      v-if="visible"
      data-testid="sql-sample-picker-panel"
      class="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-compass-surface border-t border-compass-border"
      style="height: 70vh"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-compass-border flex-shrink-0">
        <h3 class="text-compass-heading font-semibold text-sm">Sample Queries</h3>
        <button
          data-testid="sql-sample-picker-close-btn"
          class="text-compass-muted hover:text-compass-text transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Two-pane body -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left pane: query list -->
        <div class="w-64 flex-shrink-0 border-r border-compass-border overflow-y-auto">
          <button
            v-for="q in queries"
            :key="q.id"
            :data-testid="`sql-sample-picker-item-${q.id}`"
            class="w-full text-left px-4 py-3 border-b border-compass-border transition-colors hover:bg-compass-elevated"
            :class="activeId === q.id ? 'bg-compass-elevated text-compass-heading' : 'text-compass-text'"
            @click="select(q)"
          >
            <div class="text-xs font-medium">{{ q.name }}</div>
            <div class="text-xs text-compass-muted mt-0.5">{{ q.source }}</div>
          </button>
        </div>

        <!-- Right pane: detail -->
        <div v-if="activeQuery" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <!-- Rendered markdown description -->
          <div
            class="prose prose-sm prose-invert max-w-none text-compass-text"
            v-html="descriptionHtml(activeQuery)"
          />

          <!-- SQL preview -->
          <div>
            <div class="text-xs font-semibold text-compass-muted mb-1">SQL</div>
            <pre class="text-xs bg-compass-bg rounded p-3 overflow-x-auto text-compass-text font-mono">{{ activeQuery.sql }}</pre>
          </div>

          <button
            data-testid="sql-sample-picker-apply-btn"
            class="mt-auto self-start px-4 py-2 text-sm rounded bg-compass-accent text-white hover:opacity-90 transition-opacity"
            @click="apply"
          >
            Apply This Query
          </button>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-compass-muted text-sm">
          Select a query from the list
        </div>
      </div>
    </div>
  </Teleport>
</template>
