<script setup lang="ts">
import type { MongoDocument } from '../types'
import type { JsonNodeValue } from '../types'
import JsonNode from './JsonNode.vue'

defineProps<{
  results: MongoDocument[]
  isLoading: boolean
  fetchError: string | null
}>()

function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string): void {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function copyDoc(doc: MongoDocument): void {
  copyToClipboard(JSON.stringify(doc, null, 2))
}

function copyAll(docs: MongoDocument[]): void {
  copyToClipboard(JSON.stringify(docs, null, 2))
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-3" data-testid="results-viewer">

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center h-32 text-compass-muted"
      data-testid="results-loading-indicator"
    >
      <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading…
    </div>

    <!-- Error -->
    <div
      v-else-if="fetchError"
      class="p-4 bg-red-950 border border-compass-error rounded text-compass-error text-sm font-mono"
      data-testid="results-error-message"
    >
      <span class="font-semibold">Error: </span>{{ fetchError }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="results.length === 0"
      class="flex flex-col items-center justify-center h-32 text-compass-muted text-sm"
      data-testid="results-empty-state"
    >
      <svg class="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      No documents. Run a query to see results.
    </div>

    <!-- Results -->
    <template v-else>
      <div class="flex justify-end mb-1">
        <button
          class="text-xs text-compass-muted hover:text-compass-text transition-colors px-2 py-1 border border-compass-border rounded"
          @click="copyAll(results)"
        >
          Copy All JSON
        </button>
      </div>

      <div
        v-for="(doc, index) in results"
        :key="index"
        class="bg-compass-surface border border-compass-border rounded overflow-hidden"
        :data-testid="`results-document-card-${index}`"
      >
        <!-- Card header -->
        <div class="flex items-center justify-between px-3 py-2 border-b border-compass-border bg-compass-elevated">
          <span class="text-xs text-compass-muted font-mono">Document {{ index + 1 }}</span>
          <button
            class="text-xs text-compass-muted hover:text-compass-accent transition-colors"
            :data-testid="`results-copy-btn-${index}`"
            @click="copyDoc(doc)"
          >
            Copy JSON
          </button>
        </div>

        <!-- JSON tree -->
        <div class="p-3 overflow-x-auto">
          <JsonNode :value="doc" :depth="0" />
        </div>
      </div>
    </template>
  </div>
</template>
