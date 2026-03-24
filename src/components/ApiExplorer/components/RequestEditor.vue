<script setup lang="ts">
import { ref } from 'vue'
import type { ContentType, HeaderEntry, ApiPreset, HttpMethod } from '../types'

const props = defineProps<{
  body: string
  contentType: ContentType
  headers: HeaderEntry[]
  presets: ApiPreset[]
  method: HttpMethod
}>()

const emit = defineEmits<{
  (e: 'update:body', value: string): void
  (e: 'update:contentType', value: ContentType): void
  (e: 'update:headers', value: HeaderEntry[]): void
  (e: 'applyPreset', preset: ApiPreset): void
}>()

const CONTENT_TYPES: ContentType[] = ['application/json', 'application/xml', 'text/plain', 'none']

const headersExpanded = ref(false)

const enabledHeaderCount = () => props.headers.filter(h => h.enabled && h.key.trim()).length
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Content-type tabs -->
    <div class="flex items-center gap-1 flex-wrap">
      <span class="text-xs text-compass-muted mr-1">Body:</span>
      <button
        v-for="ct in CONTENT_TYPES"
        :key="ct"
        :data-testid="`content-type-tab-${ct}`"
        :class="[
          'text-xs px-2.5 py-1 rounded border transition-colors',
          props.contentType === ct
            ? 'bg-compass-accent/20 border-compass-accent text-compass-accent'
            : 'border-compass-border text-compass-muted hover:border-compass-text hover:text-compass-text',
        ]"
        @click="emit('update:contentType', ct)"
      >
        {{ ct === 'none' ? 'none' : ct }}
      </button>
    </div>

    <!-- Body textarea -->
    <textarea
      v-if="props.contentType !== 'none'"
      :value="props.body"
      data-testid="request-body-textarea"
      class="w-full h-40 font-mono text-sm bg-compass-elevated border border-compass-border rounded p-2 text-compass-text resize-y focus:outline-none focus:ring-1 focus:ring-compass-accent"
      placeholder="Request body…"
      @input="emit('update:body', $event.target.value)"
    />

    <!-- Preset chips -->
    <div v-if="props.presets.length > 0" class="flex flex-wrap gap-1.5">
      <span class="text-xs text-compass-muted self-center">Presets:</span>
      <button
        v-for="preset in props.presets"
        :key="preset.id"
        :data-testid="`preset-btn-${preset.id}`"
        class="text-xs px-2 py-0.5 rounded border border-compass-border text-compass-muted hover:border-compass-accent hover:text-compass-accent transition-colors"
        @click="emit('applyPreset', preset)"
      >
        {{ preset.name }}
      </button>
    </div>

    <!-- Headers section -->
    <div class="border border-compass-border rounded">
      <button
        data-testid="headers-toggle-btn"
        class="flex items-center justify-between w-full px-3 py-2 text-xs text-compass-text hover:bg-compass-elevated transition-colors"
        @click="headersExpanded = !headersExpanded"
      >
        <span>
          Headers
          <span v-if="props.headers.length > 0" class="ml-1 text-compass-muted">
            ({{ enabledHeaderCount() }} active)
          </span>
        </span>
        <svg
          :class="['w-3.5 h-3.5 text-compass-muted transition-transform', headersExpanded ? 'rotate-180' : '']"
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div v-if="headersExpanded" class="border-t border-compass-border px-3 py-2 space-y-1.5">
        <div
          v-for="(header, idx) in props.headers"
          :key="header.id"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            :checked="header.enabled"
            class="shrink-0 accent-compass-accent"
            @change="emit('update:headers', props.headers.map((h, i) => i === idx ? { ...h, enabled: !h.enabled } : h))"
          />
          <input
            :value="header.key"
            :data-testid="`header-key-input-${idx}`"
            placeholder="Key"
            class="flex-1 min-w-0 text-xs font-mono bg-compass-elevated border border-compass-border rounded px-2 py-1 text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent"
            @input="emit('update:headers', props.headers.map((h, i) => i === idx ? { ...h, key: $event.target.value } : h))"
          />
          <input
            :value="header.value"
            :data-testid="`header-value-input-${idx}`"
            placeholder="Value"
            class="flex-1 min-w-0 text-xs font-mono bg-compass-elevated border border-compass-border rounded px-2 py-1 text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent"
            @input="emit('update:headers', props.headers.map((h, i) => i === idx ? { ...h, value: $event.target.value } : h))"
          />
          <button
            :data-testid="`header-remove-btn-${idx}`"
            class="shrink-0 text-compass-muted hover:text-compass-error transition-colors"
            @click="emit('update:headers', props.headers.filter((_, i) => i !== idx))"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <button
          data-testid="add-header-btn"
          class="text-xs text-compass-accent hover:underline mt-1"
          @click="emit('update:headers', [...props.headers, { id: `h${Date.now()}`, key: '', value: '', enabled: true }])"
        >
          + Add Header
        </button>
      </div>
    </div>
  </div>
</template>
