<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUrlParams } from '../../lib/useUrlParams'
import { useTaskPoll } from './composables/useTaskPoll'
import GetTaskPage from './components/pages/GetTaskPage.vue'
import TaskViewerPage from './components/pages/TaskViewerPage.vue'

const taskId = ref('')
useUrlParams({ taskId })

const poll = useTaskPoll(taskId)

function onNavigate(page: string, id?: string): void {
  if (page === 'viewer' && id) taskId.value = id
}

function clearTask(): void { taskId.value = '' }

watch(taskId, (newId, oldId) => {
  if (newId) poll.start()
  else if (oldId) poll.pause()
})

onMounted(() => {
  if (taskId.value) poll.start()
})
</script>

<template>
  <div class="h-full bg-compass-bg">
    <GetTaskPage
      v-if="!taskId"
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
