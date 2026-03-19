<script setup lang="ts">
import TaskIdList from '../TaskIdList.vue'

defineProps<{
  activeTasks: string[]
  storedTasks: string[]
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  navigate: [page: string, taskId?: string]
}>()
</script>

<template>
  <div class="flex h-full flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-compass-heading">Task Dashboard</h2>
      <div class="flex gap-2">
        <button
          data-testid="dashboard-refresh-btn"
          class="rounded border border-compass-border bg-compass-surface px-3 py-1.5 text-sm text-compass-text transition-colors hover:border-compass-accent hover:text-compass-accent disabled:opacity-50"
          :disabled="isLoading"
          @click="emit('navigate', 'refresh')"
        >
          {{ isLoading ? 'Loading…' : 'Refresh' }}
        </button>
        <button
          data-testid="dashboard-get-task-btn"
          class="rounded border border-compass-border bg-compass-surface px-3 py-1.5 text-sm text-compass-text transition-colors hover:border-compass-accent hover:text-compass-accent"
          @click="emit('navigate', 'get-task')"
        >
          Look up task
        </button>
        <button
          data-testid="dashboard-create-injection-btn"
          class="rounded border border-compass-border bg-compass-surface px-3 py-1.5 text-sm text-compass-text transition-colors hover:border-compass-accent hover:text-compass-accent"
          @click="emit('navigate', 'create-injection')"
        >
          New injection
        </button>
        <button
          data-testid="dashboard-create-tracking-btn"
          class="rounded border border-compass-border bg-compass-surface px-3 py-1.5 text-sm text-compass-text transition-colors hover:border-compass-accent hover:text-compass-accent"
          @click="emit('navigate', 'create-tracking')"
        >
          New tracking
        </button>
      </div>
    </div>

    <div
      v-if="error"
      data-testid="dashboard-error"
      class="rounded border border-compass-error bg-red-900/20 px-3 py-2 text-sm text-compass-error"
    >
      {{ error }}
    </div>

    <div class="grid flex-1 grid-cols-2 gap-6 overflow-hidden">
      <TaskIdList
        :ids="activeTasks"
        label="Active tasks"
        empty-text="No active tasks"
        @select="id => emit('navigate', 'viewer', id)"
      />
      <TaskIdList
        :ids="storedTasks"
        label="Stored results"
        empty-text="No stored results"
        @select="id => emit('navigate', 'viewer', id)"
      />
    </div>
  </div>
</template>
