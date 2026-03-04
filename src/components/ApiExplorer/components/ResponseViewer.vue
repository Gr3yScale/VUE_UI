<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApiResponse } from '../types'

const props = defineProps<{
  response: ApiResponse | null
  isLoading: boolean
  sendError: string | null
}>()

const headersExpanded = ref(false)

const statusColor = computed(() => {
  if (!props.response) return ''
  const s = props.response.status
  if (s <= 299) return 'bg-green-900/40 text-green-300 border-green-700'
  if (s <= 399) return 'bg-yellow-900/40 text-yellow-300 border-yellow-700'
  if (s <= 499) return 'bg-orange-900/40 text-orange-300 border-orange-700'
  return 'bg-red-900/40 text-red-300 border-red-700'
})

const formattedBody = computed(() => {
  if (!props.response?.body) return ''
  const ct = props.response.contentType ?? ''
  if (ct.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(props.response.body), null, 2)
    } catch {
      // fall through to raw
    }
  }
  return props.response.body
})

const responseHeaders = computed(() => {
  if (!props.response) return []
  return Object.entries(props.response.headers).filter(([, v]) => v !== '')
})

function copyBody(): void {
  const text = formattedBody.value
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Loading -->
    <div v-if="props.isLoading" class="flex items-center justify-center flex-1 text-compass-muted text-sm">
      <svg class="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Sending…
    </div>

    <!-- Error -->
    <div v-else-if="props.sendError" class="p-4 text-sm text-compass-error">
      {{ props.sendError }}
    </div>

    <!-- Empty state -->
    <div v-else-if="!props.response" class="flex items-center justify-center flex-1 text-compass-muted text-sm">
      Send a request to see the response.
    </div>

    <!-- Response -->
    <template v-else>
      <!-- Status bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-compass-border flex-shrink-0">
        <span
          :class="statusColor"
          class="inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-semibold"
        >
          {{ props.response.status }} {{ props.response.statusText }}
        </span>
        <span class="text-xs text-compass-muted font-mono">{{ props.response.elapsed }}ms</span>
        <button
          v-if="props.response.body"
          data-testid="response-copy-btn"
          class="ml-auto text-xs text-compass-muted hover:text-compass-text transition-colors"
          @click="copyBody"
        >
          Copy body
        </button>
      </div>

      <!-- Response headers (collapsible) -->
      <div class="border-b border-compass-border flex-shrink-0">
        <button
          data-testid="response-headers-toggle"
          class="flex items-center justify-between w-full px-4 py-2 text-xs text-compass-text hover:bg-compass-elevated transition-colors"
          @click="headersExpanded = !headersExpanded"
        >
          <span>Response Headers ({{ responseHeaders.length }})</span>
          <svg
            :class="['w-3.5 h-3.5 text-compass-muted transition-transform', headersExpanded ? 'rotate-180' : '']"
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <div
          v-if="headersExpanded"
          data-testid="response-headers-panel"
          class="px-4 pb-2 border-t border-compass-border"
        >
          <table class="w-full text-xs font-mono">
            <tbody>
              <tr v-for="[key, value] in responseHeaders" :key="key">
                <td class="text-compass-muted pr-4 py-0.5 align-top whitespace-nowrap">{{ key }}</td>
                <td class="text-compass-text py-0.5 break-all">{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-auto p-4">
        <pre
          v-if="props.response.body"
          data-testid="response-body"
          class="font-mono text-xs text-compass-text whitespace-pre-wrap break-all"
        >{{ formattedBody }}</pre>
        <span v-else class="text-xs text-compass-muted italic">Empty body</span>
      </div>
    </template>
  </div>
</template>
