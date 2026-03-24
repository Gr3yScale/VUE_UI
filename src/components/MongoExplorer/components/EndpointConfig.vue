<script setup lang="ts">
defineProps<{
  value: string
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
}>()
</script>

<template>
  <div class="flex items-center gap-3 mt-2">
    <label
      for="endpoint-url"
      class="text-xs font-medium text-compass-muted uppercase tracking-wider whitespace-nowrap"
      data-testid="endpoint-config-label"
    >
      API Endpoint
    </label>
    <input
      id="endpoint-url"
      :value="value"
      type="url"
      placeholder="https://api.example.com/query"
      class="flex-1 bg-compass-elevated border border-compass-border rounded px-3 py-1.5 text-sm text-compass-text font-mono placeholder-compass-muted focus:outline-none focus:border-compass-accent transition-colors"
      data-testid="endpoint-config-url-input"
      @input="emit('input', $event.target.value)"
    />
  </div>
</template>
