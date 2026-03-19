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

watch(taskId, (newId, oldId) => {
  if (newId) poll.start()
  else if (oldId) poll.pause()
})

onMounted(() => {
  if (taskId.value) poll.start()
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden bg-compass-bg md:flex-row">
    <div class="w-full flex-shrink-0 border-b border-compass-border overflow-y-auto md:w-72 md:border-b-0 md:border-r">
      <GetTaskPage @navigate="onNavigate" />
    </div>
    <div class="min-h-0 flex-1 overflow-hidden border-t border-compass-border md:border-t-0">
      <TaskViewerPage
        :task-id="taskId"
        :entries="poll.entries.value"
        :is-polling="poll.isPolling.value"
        :is-stopped="poll.isStopped.value"
        :error="poll.error.value"
        @cancel="poll.cancel()"
      />
    </div>
  </div>
</template>
