<script setup lang="ts">
import type { HttpMethod } from '../types'

const props = defineProps<{ method: HttpMethod }>()

const COLOR_MAP: Record<HttpMethod, string> = {
  GET: 'bg-blue-900/40 text-blue-300 border-blue-700',
  POST: 'bg-green-900/40 text-green-300 border-green-700',
  PUT: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  PATCH: 'bg-orange-900/40 text-orange-300 border-orange-700',
  DELETE: 'bg-red-900/40 text-red-300 border-red-700',
}
</script>

<template>
  <span
    :data-testid="`method-badge-${props.method}`"
    :class="COLOR_MAP[props.method]"
    class="inline-block px-1.5 py-0.5 text-xs font-mono font-semibold rounded border leading-none"
  >
    {{ props.method }}
  </span>
</template>
