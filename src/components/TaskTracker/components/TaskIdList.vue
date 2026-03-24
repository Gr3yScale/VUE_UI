<script setup lang="ts">
defineProps<{
  ids: string[]
  label: string
  emptyText: string
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <div>
    <h3 class="mb-2 text-sm font-semibold text-compass-heading">{{ label }}</h3>
    <div
      v-if="ids.length === 0"
      class="rounded border border-compass-border bg-compass-surface px-3 py-4 text-center text-sm text-compass-muted"
    >
      {{ emptyText }}
    </div>
    <ul v-else class="space-y-1" :data-testid="`task-id-list-${label.toLowerCase().replace(/\s+/g, '-')}`">
      <li
        v-for="id in ids"
        :key="id"
        :data-testid="`task-id-item-${id}`"
        class="cursor-pointer rounded border border-compass-border bg-compass-surface px-3 py-2 font-mono text-xs text-compass-accent transition-colors hover:border-compass-accent hover:bg-compass-elevated"
        @click="$emit('select', id)"
      >
        {{ id }}
      </li>
    </ul>
  </div>
</template>
