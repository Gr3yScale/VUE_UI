<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUrlParams } from '../../lib/useUrlParams'
import { useTaskPoll } from './composables/useTaskPoll'
import { useCreateTracking } from './composables/useCreateTracking'
import CreateTrackingPage from './components/pages/CreateTrackingPage.vue'
import TaskViewerPage from './components/pages/TaskViewerPage.vue'

const taskId = ref('')
useUrlParams({ taskId })

const tracking = useCreateTracking()
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
    <CreateTrackingPage
      v-if="!taskId"
      :services-input="tracking.servicesInput.value"
      :message-ref="tracking.messageRef.value"
      :total-timeout-ms="tracking.totalTimeoutMs.value"
      :is-submitting="tracking.isSubmitting.value"
      :submit-error="tracking.submitError.value"
      :created-task-id="tracking.createdTaskId.value"
      @update:services-input="v => { tracking.servicesInput.value = v }"
      @update:message-ref="v => { tracking.messageRef.value = v }"
      @update:total-timeout-ms="v => { tracking.totalTimeoutMs.value = v }"
      @submit="tracking.submit()"
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
