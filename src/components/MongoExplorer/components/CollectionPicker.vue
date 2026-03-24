<script setup lang="ts">
import DropdownPicker from '@/components/shared/DropdownPicker.vue'

defineProps<{
  collections: string[]
  value: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'input', value: string): void
}>()
</script>

<template>
  <DropdownPicker
    :options="collections"
    :value="value"
    :disabled="disabled"
    placeholder="Select collection…"
    testid="collection-picker-select"
    @input="$emit('input', $event)"
  />
</template>
