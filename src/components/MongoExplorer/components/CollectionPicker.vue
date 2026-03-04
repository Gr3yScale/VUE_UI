<script setup lang="ts">
import DropdownPicker from '@/components/shared/DropdownPicker.vue'

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
  <DropdownPicker
    :options="collections"
    :model-value="modelValue"
    :disabled="disabled"
    placeholder="Select collection…"
    testid="collection-picker-select"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
