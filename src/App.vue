<script setup lang="ts">
import { ref } from 'vue'
import { registry } from './registry'
import type { PlaygroundEntry } from './types/playground'

const selected = ref<PlaygroundEntry>(registry[0]!)

function select(entry: PlaygroundEntry): void {
  selected.value = entry
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-compass-bg">
    <!-- Sidebar: component list -->
    <aside
      class="w-56 flex-shrink-0 border-r border-compass-border bg-compass-surface flex flex-col"
      data-testid="playground-sidebar"
    >
      <div class="px-4 py-4 border-b border-compass-border">
        <h1 class="text-compass-heading font-bold text-xs uppercase tracking-widest">
          Vue UI
        </h1>
        <p class="text-compass-muted text-[11px] mt-0.5">Component Playground</p>
      </div>

      <nav class="flex-1 overflow-y-auto py-1">
        <button
          v-for="entry in registry"
          :key="entry.id"
          :data-testid="`sidebar-entry-${entry.id}`"
          :class="[
            'w-full text-left px-4 py-2.5 transition-colors border-l-2',
            selected.id === entry.id
              ? 'bg-compass-elevated text-compass-heading border-compass-accent'
              : 'text-compass-text hover:bg-compass-elevated hover:text-compass-heading border-transparent',
          ]"
          @click="select(entry)"
        >
          <span class="block text-xs font-medium">{{ entry.label }}</span>
          <span class="block text-[11px] text-compass-muted mt-0.5">{{ entry.description }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main area: renders the selected component -->
    <main class="flex-1 overflow-hidden" data-testid="playground-main">
      <component :is="selected.component" />
    </main>
  </div>
</template>
