<script setup lang="ts">
import type { ApiEndpoint } from '../types'
import MethodBadge from './MethodBadge.vue'

defineProps<{
  endpoints: ApiEndpoint[]
  selectedId: string | null
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <div data-testid="endpoint-list" class="flex flex-col overflow-y-auto">
    <button
      v-for="ep in endpoints"
      :key="ep.id"
      :data-testid="`endpoint-item-${ep.id}`"
      :class="[
        'flex flex-col gap-0.5 px-3 py-2.5 text-left w-full border-b border-compass-border transition-colors',
        ep.id === selectedId
          ? 'bg-compass-elevated text-compass-heading'
          : 'text-compass-text hover:bg-compass-elevated',
      ]"
      @click="$emit('select', ep.id)"
    >
      <div class="flex items-center gap-2">
        <MethodBadge :method="ep.method" />
        <span class="font-mono text-xs truncate">{{ ep.path }}</span>
      </div>
      <span class="text-xs text-compass-muted pl-0.5">{{ ep.name }}</span>
    </button>
  </div>
</template>
