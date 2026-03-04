<script setup lang="ts">
defineProps<{
  collections: string[]
  modelValue: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <select
    data-testid="collection-picker-select"
    :value="modelValue"
    :disabled="disabled"
    class="text-sm rounded border border-compass-border bg-compass-input text-compass-text px-2 py-1 focus:outline-none focus:ring-1 focus:ring-compass-accent disabled:opacity-50"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="" disabled>Select collection…</option>
    <option
      v-for="name in collections"
      :key="name"
      :value="name"
      :data-testid="`collection-picker-option-${name}`"
    >
      {{ name }}
    </option>
  </select>
</template>
