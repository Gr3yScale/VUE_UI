<script setup lang="ts">
import { ref, computed } from 'vue'
import { SQL_CHEAT_SHEET } from '../data/sqlCheatSheetData'
import type { SqlFlavor } from '../types'

const props = defineProps<{
  visible: boolean
  flavor: SqlFlavor
}>()

const emit = defineEmits<{
  close: []
}>()

const categories = computed(() => SQL_CHEAT_SHEET[props.flavor] ?? [])
const openCategories = ref<Set<string>>(new Set(categories.value.map((c) => c.label)))

function toggleCategory(label: string): void {
  if (openCategories.value.has(label)) {
    openCategories.value.delete(label)
  } else {
    openCategories.value.add(label)
  }
  openCategories.value = new Set(openCategories.value)
}

function copySnippet(snippet: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(snippet).catch(() => fallbackCopy(snippet))
  } else {
    fallbackCopy(snippet)
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
</script>

<template>
  <aside
    v-if="visible"
    class="w-72 flex-shrink-0 border-r border-compass-border bg-compass-surface flex flex-col"
    data-testid="sql-cheatsheet-panel"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-compass-border">
      <div class="flex items-center gap-2">
        <h3 class="text-xs font-semibold text-compass-heading uppercase tracking-widest">
          SQL Reference
        </h3>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-compass-elevated text-compass-accent border border-compass-border">
          {{ flavor }}
        </span>
      </div>
      <button
        class="text-compass-muted hover:text-compass-text transition-colors"
        data-testid="sql-cheatsheet-close-btn"
        @click="emit('close')"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="category in categories"
        :key="category.label"
        class="border-b border-compass-border last:border-0"
      >
        <!-- Category header -->
        <button
          class="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-compass-elevated transition-colors"
          @click="toggleCategory(category.label)"
        >
          <span class="text-xs font-semibold text-compass-text uppercase tracking-wider">
            {{ category.label }}
          </span>
          <svg
            class="w-3.5 h-3.5 text-compass-muted transition-transform"
            :class="{ 'rotate-180': openCategories.has(category.label) }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Entries -->
        <div v-if="openCategories.has(category.label)" class="px-3 pb-3 space-y-2">
          <div
            v-for="entry in category.entries"
            :key="entry.keyword"
            class="bg-compass-elevated rounded p-2 space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="text-compass-accent font-mono text-xs font-semibold">
                {{ entry.keyword }}
              </span>
              <button
                class="text-[10px] text-compass-muted hover:text-compass-accent transition-colors px-1.5 py-0.5 border border-compass-border rounded"
                :data-testid="`sql-cheatsheet-copy-${entry.keyword.replace(/\s+/g, '-')}`"
                @click="copySnippet(entry.snippet)"
              >
                Copy
              </button>
            </div>
            <p class="text-[11px] text-compass-muted leading-snug">{{ entry.description }}</p>
            <pre class="text-[10px] text-compass-string bg-compass-bg rounded px-2 py-1 overflow-x-auto">{{ entry.snippet }}</pre>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
