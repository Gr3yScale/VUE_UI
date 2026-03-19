import { computed, ref } from 'vue'
import { useUrlParams } from '../../../lib/useUrlParams'
import { sendCustomMqMessage } from '../api'
import type { UseMqCustomSendReturn } from '../types'

/** Manages state and logic for sending a message via a custom MQ connection. */
export function useMqCustomSend(): UseMqCustomSendReturn {
  const host = ref('')
  const port = ref('')
  const channel = ref('')
  const queueManager = ref('')
  const queueName = ref('')
  const message = ref('')
  const delimiter = ref('')

  useUrlParams({ host, port, channel, qm: queueManager, queue: queueName, msg: message, delim: delimiter })
  const response = ref<unknown>(null)
  const isLoading = ref(false)
  const sendError = ref<string | null>(null)

  const canSend = computed(
    () =>
      host.value.trim() !== '' &&
      port.value.trim() !== '' &&
      channel.value.trim() !== '' &&
      queueManager.value.trim() !== '' &&
      queueName.value.trim() !== '' &&
      message.value.trim() !== '',
  )

  async function send(): Promise<void> {
    sendError.value = null
    isLoading.value = true
    try {
      response.value = await sendCustomMqMessage(
        {
          host: host.value,
          port: Number(port.value),
          channel: channel.value,
          queueManager: queueManager.value,
          queueName: queueName.value,
          message: message.value,
        },
        delimiter.value || undefined,
      )
    } catch (e) {
      sendError.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  return {
    host,
    port,
    channel,
    queueManager,
    queueName,
    message,
    delimiter,
    response,
    isLoading,
    sendError,
    canSend,
    send,
  }
}
