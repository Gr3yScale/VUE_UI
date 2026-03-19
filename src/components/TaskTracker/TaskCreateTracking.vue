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

// Auto-open viewer when a task is successfully created
watch(() => tracking.createdTaskId.value, (id) => {
  if (id) taskId.value = id
})

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
    <div class="w-full flex-shrink-0 border-b border-compass-border overflow-y-auto md:w-80 md:border-b-0 md:border-r">
      <CreateTrackingPage
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
      />
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
