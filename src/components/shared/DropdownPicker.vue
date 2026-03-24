<script setup lang="ts">
defineProps<{
  options: string[]
  value: string
  disabled?: boolean
  placeholder?: string
  testid?: string
}>()

defineEmits<{
  (e: 'input', value: string): void
}>()
</script>

<template>
  <select
    :data-testid="testid ?? 'dropdown-picker-select'"
    :value="value"
    :disabled="disabled"
    class="text-sm rounded border border-compass-border bg-compass-elevated text-compass-text px-2 py-1 focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
    @change="$emit('input', $event.target.value)"
  >
    <option value="" disabled class="bg-compass-elevated text-compass-muted">
      {{ placeholder ?? 'Select…' }}
    </option>
    <option
      v-for="opt in options"
      :key="opt"
      :value="opt"
      class="bg-compass-elevated text-compass-text"
    >
      {{ opt }}
    </option>
  </select>
</template>
