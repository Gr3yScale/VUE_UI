<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  navigate: [page: string, taskId?: string]
}>()

const taskIdInput = ref('')

function submit(): void {
  const id = taskIdInput.value.trim()
  if (!id) return
  emit('navigate', 'viewer', id)
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-6 p-6">
    <div class="w-full max-w-lg rounded border border-compass-border bg-compass-surface p-6">
      <h2 class="mb-4 text-lg font-semibold text-compass-heading">Look Up Task</h2>
      <p class="mb-4 text-sm text-compass-muted">Enter a task ID to view its live status and history.</p>

      <form class="flex flex-col gap-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs font-medium text-compass-muted" for="get-task-id-input">
            Task ID
          </label>
          <input
            id="get-task-id-input"
            v-model="taskIdInput"
            data-testid="get-task-id-input"
            type="text"
            placeholder="e.g. 3f2a1b4c-…"
            class="w-full rounded border border-compass-border bg-compass-elevated px-3 py-2 font-mono text-sm text-compass-text placeholder-compass-muted focus:outline-none focus:ring-1 focus:ring-compass-accent"
          />
        </div>
        <div class="flex justify-between">
          <button
            type="button"
            data-testid="get-task-back-btn"
            class="rounded border border-compass-border bg-transparent px-3 py-2 text-sm text-compass-muted transition-colors hover:border-compass-accent hover:text-compass-text"
            @click="emit('navigate', 'dashboard')"
          >
            Back
          </button>
          <button
            type="submit"
            data-testid="get-task-submit-btn"
            class="rounded bg-compass-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            :disabled="!taskIdInput.trim()"
          >
            View task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
