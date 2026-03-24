<script lang="ts">
export default { name: 'JsonNode' }
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { JsonNodeValue, JsonNodeType } from '../types'
// Recursive self-import — Vue 2.7 <script setup> supports this natively
import JsonNode from './JsonNode.vue'

const props = withDefaults(
  defineProps<{
    nodeKey?: string | number
    value: JsonNodeValue
    depth?: number
  }>(),
  { depth: 0 },
)

const nodeType = computed((): JsonNodeType => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  if (typeof props.value === 'object') return 'object'
  return typeof props.value as JsonNodeType
})

const isExpandable = computed(() => nodeType.value === 'object' || nodeType.value === 'array')

// Default: expanded for depth 0 and 1; collapsed for deeper nodes
const expanded = ref(props.depth < 2)

function toggle(): void {
  expanded.value = !expanded.value
}

const childEntries = computed((): Array<{ key: string | number; value: JsonNodeValue }> => {
  if (nodeType.value === 'array') {
    return (props.value as JsonNodeValue[]).map((v, i) => ({ key: i, value: v }))
  }
  if (nodeType.value === 'object') {
    return Object.entries(props.value as Record<string, JsonNodeValue>).map(([k, v]) => ({
      key: k,
      value: v,
    }))
  }
  return []
})

const childCount = computed(() => childEntries.value.length)

const leafDisplayValue = computed((): string => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'string') return `"${props.value}"`
  return String(props.value)
})

const leafColorClass = computed((): string => {
  switch (nodeType.value) {
    case 'string':  return 'text-compass-string'
    case 'number':  return 'text-compass-number'
    case 'boolean': return 'text-compass-boolean'
    case 'null':    return 'text-compass-nullColor'
    default:        return 'text-compass-text'
  }
})

const openBrace  = computed(() => nodeType.value === 'array' ? '[' : '{')
const closeBrace = computed(() => nodeType.value === 'array' ? ']' : '}')
</script>

<template>
  <div
    class="font-mono text-xs leading-relaxed"
    :style="{ paddingLeft: depth > 0 ? '1rem' : '0' }"
    :data-testid="`json-node-${nodeKey ?? 'root'}-${depth}`"
  >
    <!-- Expandable: object or array -->
    <template v-if="isExpandable">
      <button
        class="flex items-center gap-1 w-full text-left hover:opacity-80 transition-opacity"
        data-testid="json-node-toggle-btn"
        @click="toggle"
      >
        <!-- Chevron -->
        <svg
          class="w-3 h-3 flex-shrink-0 text-compass-muted transition-transform"
          :class="{ 'rotate-90': expanded }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <!-- Key (if any) -->
        <span v-if="nodeKey !== undefined" class="text-compass-key">
          {{ typeof nodeKey === 'string' ? `"${nodeKey}"` : nodeKey }}:&nbsp;
        </span>

        <!-- Opening brace + collapsed preview -->
        <span class="text-compass-muted">{{ openBrace }}</span>
        <template v-if="!expanded">
          <span class="text-compass-muted italic">&nbsp;…{{ childCount }} {{ nodeType === 'array' ? 'items' : 'fields' }}&nbsp;</span>
          <span class="text-compass-muted">{{ closeBrace }}</span>
        </template>
      </button>

      <!-- Children -->
      <div v-if="expanded" class="ml-3 border-l border-compass-border pl-2">
        <JsonNode
          v-for="child in childEntries"
          :key="child.key"
          :nodeKey="child.key"
          :value="child.value"
          :depth="depth + 1"
        />
        <div class="text-compass-muted">{{ closeBrace }}</div>
      </div>
    </template>

    <!-- Leaf: string, number, boolean, null -->
    <template v-else>
      <span class="flex items-baseline gap-1 flex-wrap">
        <span v-if="nodeKey !== undefined" class="text-compass-key">
          {{ typeof nodeKey === 'string' ? `"${nodeKey}"` : nodeKey }}:
        </span>
        <span :class="leafColorClass">{{ leafDisplayValue }}</span>
        <span class="text-compass-muted opacity-50 text-[10px]">[{{ nodeType }}]</span>
      </span>
    </template>
  </div>
</template>
