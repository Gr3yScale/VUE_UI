<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  columns: string[]
  rows: unknown[][]
  isLoading: boolean
  hasMore: boolean
  fetchError: string | null
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

interface TooltipState {
  visible: boolean
  value: string
  x: number
  y: number
}
const tooltip = ref<TooltipState>({ visible: false, value: '', x: 0, y: 0 })

function displayValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = typeof val === 'string' ? val : JSON.stringify(val)
  if (str.length > 200) return `[TEXT: ${str.length}ch]`
  return str
}

function fullValue(val: unknown): string {
  if (val === null || val === undefined) return '(null)'
  return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
}

function showTooltip(event: MouseEvent, val: unknown): void {
  const full = fullValue(val)
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    value: full,
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 4,
  }
}

function hideTooltip(): void {
  tooltip.value = { ...tooltip.value, visible: false }
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

function copyRow(row: unknown[]): void {
  const text = row.map(v => fullValue(v)).join('\t')
  void copyToClipboard(text)
}

function setupObserver(): void {
  teardownObserver()
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && props.hasMore && !props.isLoading) {
        emit('loadMore')
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(sentinel.value)
}

function teardownObserver(): void {
  observer?.disconnect()
  observer = null
}

watch(
  [() => props.hasMore, () => props.isLoading],
  async ([hasMore, isLoading]) => {
    if (hasMore && !isLoading) {
      await nextTick()
      setupObserver()
    } else {
      teardownObserver()
    }
  },
  { immediate: true },
)

onUnmounted(() => teardownObserver())
</script>

<template>
  <!-- Full-area loading state when no rows yet -->
  <div
    v-if="isLoading && rows.length === 0"
    class="flex-1 flex items-center justify-center"
  >
    <div class="flex items-center gap-2 text-compass-muted text-sm">
      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading…
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else-if="fetchError && rows.length === 0"
    class="flex-1 flex items-center justify-center"
  >
    <p class="text-compass-error text-sm">{{ fetchError }}</p>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="!isLoading && rows.length === 0 && columns.length === 0"
    class="flex-1 flex items-center justify-center"
  >
    <p class="text-compass-muted text-sm">Run a query to see results.</p>
  </div>

  <!-- Results table -->
  <div v-else class="flex-1 overflow-auto relative" data-testid="sql-results-table">
    <table class="min-w-full border-collapse text-xs">
      <thead class="sticky top-0 z-10 bg-compass-surface">
        <tr>
          <!-- Row copy column header -->
          <th class="w-6 px-1 py-2 border-b border-compass-border" />
          <th
            v-for="col in columns"
            :key="col"
            class="px-3 py-2 text-left font-semibold text-compass-muted border-b border-compass-border whitespace-nowrap"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIdx) in rows"
          :key="rowIdx"
          class="border-b border-compass-border hover:bg-compass-elevated transition-colors"
          :data-testid="`sql-results-row-${rowIdx}`"
        >
          <!-- Row copy button -->
          <td class="w-6 px-1 py-1.5 text-center">
            <button
              class="text-compass-muted hover:text-compass-accent transition-colors opacity-0 group-hover:opacity-100"
              :class="{ 'opacity-100': true }"
              :data-testid="`sql-results-copy-row-${rowIdx}`"
              title="Copy row as TSV"
              @click="copyRow(row)"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </td>
          <td
            v-for="(cell, cellIdx) in row"
            :key="cellIdx"
            class="px-3 py-1.5 text-compass-text max-w-[200px] truncate whitespace-nowrap overflow-hidden cursor-pointer hover:text-compass-accent transition-colors"
            :data-testid="`sql-results-cell-${rowIdx}-${cellIdx}`"
            :title="String(cell)"
            @click="showTooltip($event, cell)"
          >
            {{ displayValue(cell) }}
          </td>
        </tr>

        <!-- Loading spinner appended at bottom when fetching more pages -->
        <tr v-if="isLoading && rows.length > 0">
          <td :colspan="columns.length + 1" class="px-3 py-2 text-center">
            <span class="inline-flex items-center gap-1.5 text-compass-muted text-xs">
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading more…
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" data-testid="sql-results-sentinel" class="h-1" />
  </div>

  <!-- Cell value tooltip -->
  <Teleport to="body">
    <div
      v-if="tooltip.visible"
      class="fixed z-50 max-w-md"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      @mouseleave="hideTooltip"
    >
      <div class="bg-compass-surface border border-compass-border rounded shadow-lg p-3 space-y-2">
        <pre class="text-xs text-compass-text font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{{ tooltip.value }}</pre>
        <div class="flex justify-end gap-2">
          <button
            class="text-xs px-2 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text transition-colors"
            data-testid="sql-tooltip-copy-btn"
            @click="copyToClipboard(tooltip.value)"
          >
            Copy
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-compass-border text-compass-muted hover:text-compass-text transition-colors"
            data-testid="sql-tooltip-close-btn"
            @click="hideTooltip"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
