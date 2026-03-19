<script setup lang="ts">
import type { DataSource, QMSEnvironment } from '../../types'
import DropdownPicker from '../../../../components/shared/DropdownPicker.vue'
import { DATA_SOURCES, QMS_ENVIRONMENTS } from '../../config'

defineProps<{
  source: DataSource
  env: QMSEnvironment
  channel: string
  message: string
  channels: string[]
  isLoadingChannels: boolean
  isSubmitting: boolean
  submitError: string | null
  createdTaskId: string | null
}>()

const emit = defineEmits<{
  'update:source': [value: DataSource]
  'update:env': [value: QMSEnvironment]
  'update:channel': [value: string]
  'update:message': [value: string]
  submit: []
  navigate: [page: string, taskId?: string]
}>()
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto p-4">
    <h2 class="flex-shrink-0 text-sm font-semibold text-compass-heading">New Injection Task</h2>

    <!-- Success -->
    <div
      v-if="createdTaskId"
      data-testid="create-injection-success"
      class="flex-shrink-0 rounded border border-green-700 bg-green-900/20 p-3"
    >
      <p class="mb-1 text-xs text-green-400">Task created.</p>
      <p class="font-mono text-xs text-compass-text break-all">{{ createdTaskId }}</p>
    </div>

    <form class="flex flex-col gap-3" @submit.prevent="emit('submit')">
      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Source</label>
        <DropdownPicker
          :options="DATA_SOURCES"
          :model-value="source"
          testid="create-injection-source-select"
          @update:model-value="v => emit('update:source', v as DataSource)"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Environment</label>
        <DropdownPicker
          :options="QMS_ENVIRONMENTS"
          :model-value="env"
          testid="create-injection-env-select"
          @update:model-value="v => emit('update:env', v as QMSEnvironment)"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Channel</label>
        <DropdownPicker
          :options="channels"
          :model-value="channel"
          :disabled="isLoadingChannels || channels.length === 0"
          placeholder="Loading channels…"
          testid="create-injection-channel-select"
          @update:model-value="v => emit('update:channel', v)"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Message</label>
        <textarea
          :value="message"
          data-testid="create-injection-message-input"
          rows="6"
          placeholder="Enter message payload…"
          class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 font-mono text-sm text-compass-text placeholder-compass-muted focus:outline-none focus:ring-1 focus:ring-compass-accent"
          @input="emit('update:message', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div
        v-if="submitError"
        data-testid="create-injection-error"
        class="rounded border border-compass-error bg-red-900/20 px-3 py-2 text-xs text-compass-error"
      >
        {{ submitError }}
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          data-testid="create-injection-submit-btn"
          class="rounded bg-compass-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          :disabled="isSubmitting || !channel || !message"
        >
          {{ isSubmitting ? 'Submitting…' : 'Create task' }}
        </button>
      </div>
    </form>
  </div>
</template>
