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
  <div class="flex h-full flex-col gap-4 p-4">
    <div class="flex flex-shrink-0 items-center justify-between">
      <h2 class="text-sm font-semibold text-compass-heading">Tasks</h2>
      <button
        data-testid="dashboard-refresh-btn"
        class="rounded border border-compass-border bg-compass-surface px-2.5 py-1 text-xs text-compass-text transition-colors hover:border-compass-accent hover:text-compass-accent disabled:opacity-50"
        :disabled="isLoading"
        @click="emit('navigate', 'refresh')"
      >
        {{ isLoading ? 'Loading…' : 'Refresh' }}
      </button>
    </div>

    <div
      v-if="error"
      data-testid="dashboard-error"
      class="flex-shrink-0 rounded border border-compass-error bg-red-900/20 px-3 py-2 text-xs text-compass-error"
    >
      {{ error }}
    </div>

    <div class="flex flex-1 flex-col gap-5 overflow-y-auto">
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
