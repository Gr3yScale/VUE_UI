import { ref, watch } from 'vue'
import type { UseCreateInjectionReturn, DataSource, QMSEnvironment } from '../types'
import { fetchChannels, createInjectionTask } from '../api'
import { DATA_SOURCES, QMS_ENVIRONMENTS } from '../config'

/**
 * Manages form state and submission for a payment injection task.
 * Channels are reloaded automatically whenever source or env changes.
 */
export function useCreateInjection(): UseCreateInjectionReturn {
  const source = ref<DataSource>(DATA_SOURCES[0])
  const env = ref<QMSEnvironment>(QMS_ENVIRONMENTS[0])
  const channel = ref('')
  const message = ref('')
  const channels = ref<string[]>([])
  const isLoadingChannels = ref(false)
  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)
  const createdTaskId = ref<string | null>(null)

  async function loadChannels(): Promise<void> {
    if (!source.value || !env.value) return
    isLoadingChannels.value = true
    channel.value = ''
    try {
      const res = await fetchChannels(source.value, env.value)
      channels.value = res.channels
      channel.value = res.channels[0] ?? ''
    } catch (e) {
      channels.value = []
    } finally {
      isLoadingChannels.value = false
    }
  }

  watch([source, env], () => { void loadChannels() }, { immediate: true })

  async function submit(): Promise<void> {
    submitError.value = null
    createdTaskId.value = null
    isSubmitting.value = true
    try {
      const res = await createInjectionTask(source.value, {
        message: message.value,
        channel: channel.value,
        env: env.value,
      })
      createdTaskId.value = res.taskId
    } catch (e) {
      submitError.value = e instanceof Error ? e.message : 'Failed to create task'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    source,
    env,
    channel,
    message,
    channels,
    isLoadingChannels,
    isSubmitting,
    submitError,
    createdTaskId,
    submit,
  }
}
