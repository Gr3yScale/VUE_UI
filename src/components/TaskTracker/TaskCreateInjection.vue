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
    <CreateInjectionPage
      v-if="!taskId"
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
