<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUrlParams } from '../../lib/useUrlParams'
import { useTaskPoll } from './composables/useTaskPoll'
import { useCreateInjection } from './composables/useCreateInjection'
import type { DataSource, QMSEnvironment } from './types'
import CreateInjectionPage from './components/pages/CreateInjectionPage.vue'
import TaskViewerPage from './components/pages/TaskViewerPage.vue'

const taskId = ref('')
useUrlParams({ taskId })

const injection = useCreateInjection()
const poll = useTaskPoll(taskId)

function setTaskId(id: string): void { taskId.value = id }

// Auto-open viewer when a task is successfully created
watch(() => injection.createdTaskId.value, (id) => {
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
      <CreateInjectionPage
        :source="injection.source.value"
        :env="injection.env.value"
        :channel="injection.channel.value"
        :message="injection.message.value"
        :channels="injection.channels.value"
        :is-loading-channels="injection.isLoadingChannels.value"
        :is-submitting="injection.isSubmitting.value"
        :submit-error="injection.submitError.value"
        :created-task-id="injection.createdTaskId.value"
        @update:source="v => { injection.source.value = v as DataSource }"
        @update:env="v => { injection.env.value = v as QMSEnvironment }"
        @update:channel="v => { injection.channel.value = v }"
        @update:message="v => { injection.message.value = v }"
        @submit="injection.submit()"
        @navigate="(_p, id) => id && setTaskId(id)"
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
