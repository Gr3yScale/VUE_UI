<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import type { SampleQuery } from '../types'

const props = defineProps<{
  visible: boolean
  queries: SampleQuery[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  close: []
  apply: [query: SampleQuery]
}>()

const activeId = ref<string | null>(props.selectedId)

const activeQuery = computed(() =>
  props.queries.find(q => q.id === activeId.value) ?? props.queries[0] ?? null,
)

function select(q: SampleQuery) {
  activeId.value = q.id
}

function apply() {
  if (activeQuery.value) {
    emit('apply', activeQuery.value)
  }
}

function descriptionHtml(q: SampleQuery): string {
  return marked.parse(q.description) as string
}

function jsonPreview(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2)
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
      data-testid="sample-picker-panel"
      class="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-compass-surface border-t border-compass-border"
      style="height: 70vh"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-compass-border flex-shrink-0">
        <h3 class="text-compass-heading font-semibold text-sm">Sample Queries</h3>
        <button
          data-testid="sample-picker-close-btn"
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
            :data-testid="`sample-picker-item-${q.id}`"
            class="w-full text-left px-4 py-3 border-b border-compass-border transition-colors hover:bg-compass-hover"
            :class="activeId === q.id ? 'bg-compass-hover text-compass-heading' : 'text-compass-text'"
            @click="select(q)"
          >
            <div class="text-xs font-medium">{{ q.name }}</div>
            <div class="text-xs text-compass-muted mt-0.5">{{ q.collection }}</div>
          </button>
        </div>

        <!-- Right pane: detail -->
        <div v-if="activeQuery" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <!-- Rendered markdown description -->
          <div
            class="prose prose-sm prose-invert max-w-none text-compass-text"
            v-html="descriptionHtml(activeQuery)"
          />

          <!-- JSON previews -->
          <div class="space-y-2">
            <div v-if="Object.keys(activeQuery.filter).length > 0 || true">
              <div class="text-xs font-semibold text-compass-muted mb-1">Filter</div>
              <pre class="text-xs bg-compass-bg rounded p-2 overflow-x-auto text-compass-text">{{ jsonPreview(activeQuery.filter) }}</pre>
            </div>
            <div v-if="Object.keys(activeQuery.sort).length > 0">
              <div class="text-xs font-semibold text-compass-muted mb-1">Sort</div>
              <pre class="text-xs bg-compass-bg rounded p-2 overflow-x-auto text-compass-text">{{ jsonPreview(activeQuery.sort) }}</pre>
            </div>
            <div v-if="Object.keys(activeQuery.projection).length > 0">
              <div class="text-xs font-semibold text-compass-muted mb-1">Projection</div>
              <pre class="text-xs bg-compass-bg rounded p-2 overflow-x-auto text-compass-text">{{ jsonPreview(activeQuery.projection) }}</pre>
            </div>
          </div>

          <button
            data-testid="sample-picker-apply-btn"
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
