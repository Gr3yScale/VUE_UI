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
  'update:servicesInput': [value: string]
  'update:messageRef': [value: string]
  'update:totalTimeoutMs': [value: string]
  submit: []
  navigate: [page: string, taskId?: string]
}>()
</script>

<template>
  <div class="flex h-full flex-col items-start justify-start gap-6 overflow-y-auto p-6">
    <div class="w-full max-w-lg">
      <button
        data-testid="create-tracking-back-btn"
        class="mb-3 text-xs text-compass-muted transition-colors hover:text-compass-accent"
        @click="emit('navigate', 'dashboard')"
      >
        ← Dashboard
      </button>
      <h2 class="mb-1 text-lg font-semibold text-compass-heading">New Tracking Task</h2>
      <p class="mb-5 text-sm text-compass-muted">Track a message across services.</p>

      <!-- Success -->
      <div
        v-if="createdTaskId"
        data-testid="create-tracking-success"
        class="mb-4 rounded border border-green-700 bg-green-900/20 p-4"
      >
        <p class="mb-2 text-sm text-green-400">Task created successfully.</p>
        <p class="mb-3 font-mono text-xs text-compass-text break-all">{{ createdTaskId }}</p>
        <button
          data-testid="create-tracking-view-task-btn"
          class="rounded bg-compass-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          @click="emit('navigate', 'viewer', createdTaskId)"
        >
          View task
        </button>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="emit('submit')">
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
            @input="emit('update:servicesInput', ($event.target as HTMLInputElement).value)"
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
            @input="emit('update:messageRef', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-compass-muted">
            Timeout (ms)
          </label>
          <input
            :value="totalTimeoutMs"
            data-testid="create-tracking-timeout-input"
            type="number"
            min="1000"
            step="1000"
            class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 text-sm text-compass-text focus:outline-none focus:ring-1 focus:ring-compass-accent"
            @input="emit('update:totalTimeoutMs', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div
          v-if="submitError"
          data-testid="create-tracking-error"
          class="rounded border border-compass-error bg-red-900/20 px-3 py-2 text-sm text-compass-error"
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
  </div>
</template>
