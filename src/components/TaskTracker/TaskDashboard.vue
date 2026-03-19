<script setup lang="ts">
import { ref, watch, inject, onMounted } from 'vue'
import { useUrlParams } from '../../lib/useUrlParams'
import { useTaskPoll } from './composables/useTaskPoll'
import { useTaskList } from './composables/useTaskList'
import DashboardPage from './components/pages/DashboardPage.vue'
import TaskViewerPage from './components/pages/TaskViewerPage.vue'

const appNavigate = inject<(viewId: string) => void>('appNavigate', () => {})

const taskId = ref('')
useUrlParams({ taskId })

const list = useTaskList()
const poll = useTaskPoll(taskId)

function onNavigate(page: string, id?: string): void {
  if (page === 'viewer' && id) { taskId.value = id }
  else if (page === 'refresh') { void list.refresh() }
  else if (page === 'create-injection') { appNavigate('task-create-injection') }
  else if (page === 'create-tracking') { appNavigate('task-create-tracking') }
  else if (page === 'get-task') { appNavigate('task-lookup') }
}

function clearTask(): void { taskId.value = '' }

watch(taskId, (newId, oldId) => {
  if (newId) poll.start()
  else if (oldId) poll.pause()
})

onMounted(() => {
  if (taskId.value) poll.start()
  else void list.refresh()
})
</script>

<template>
  <div class="h-full bg-compass-bg">
    <DashboardPage
      v-if="!taskId"
      :active-tasks="list.activeTasks.value"
      :stored-tasks="list.storedTasks.value"
      :is-loading="list.isLoading.value"
      :error="list.error.value"
      @navigate="onNavigate"
    />
    <TaskViewerPage
      v-else
      :task-id="taskId"
      :entries="poll.entries.value"
      :is-polling="poll.isPolling.value"
      :is-stopped="poll.isStopped.value"
      :error="poll.error.value"
      @cancel="poll.cancel()"
      @navigate="clearTask"
    />
  </div>
</template>
