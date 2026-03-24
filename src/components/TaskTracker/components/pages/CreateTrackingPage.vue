<script setup lang="ts">
defineProps<{
  servicesInput: string
  messageRef: string
  totalTimeoutMs: string
  isSubmitting: boolean
  submitError: string | null
  createdTaskId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:servicesInput', value: string): void
  (e: 'update:messageRef', value: string): void
  (e: 'update:totalTimeoutMs', value: string): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto p-4">
    <h2 class="flex-shrink-0 text-sm font-semibold text-compass-heading">New Tracking Task</h2>

    <!-- Success -->
    <div
      v-if="createdTaskId"
      data-testid="create-tracking-success"
      class="flex-shrink-0 rounded border border-green-700 bg-green-900/20 p-3"
    >
      <p class="mb-1 text-xs text-green-400">Task created.</p>
      <p class="font-mono text-xs text-compass-text break-all">{{ createdTaskId }}</p>
    </div>

    <form class="flex flex-col gap-3" @submit.prevent="emit('submit')">
      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">
          Services
          <span class="ml-1 font-normal text-compass-muted/70">(comma-separated)</span>
        </label>
        <input
          :value="servicesInput"
          data-testid="create-tracking-services-input"
          type="text"
          placeholder="e.g. payment-svc, audit-svc"
          class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text placeholder-compass-muted focus:outline-none focus:ring-1 focus:ring-compass-accent"
          @input="emit('update:servicesInput', $event.target.value)"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Message ref</label>
        <input
          :value="messageRef"
          data-testid="create-tracking-message-ref-input"
          type="text"
          placeholder="e.g. MSG-12345"
          class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 font-mono text-sm text-compass-text placeholder-compass-muted focus:outline-none focus:ring-1 focus:ring-compass-accent"
          @input="emit('update:messageRef', $event.target.value)"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-compass-muted">Timeout (ms)</label>
        <input
          :value="totalTimeoutMs"
          data-testid="create-tracking-timeout-input"
          type="number"
          min="1000"
          step="1000"
          class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent"
          @input="emit('update:totalTimeoutMs', $event.target.value)"
        />
      </div>

      <div
        v-if="submitError"
        data-testid="create-tracking-error"
        class="rounded border border-compass-error bg-red-900/20 px-3 py-2 text-xs text-compass-error"
      >
        {{ submitError }}
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          data-testid="create-tracking-submit-btn"
          class="rounded bg-compass-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          :disabled="isSubmitting || !servicesInput.trim() || !messageRef.trim()"
        >
          {{ isSubmitting ? 'Submitting…' : 'Create task' }}
        </button>
      </div>
    </form>
  </div>
</template>
