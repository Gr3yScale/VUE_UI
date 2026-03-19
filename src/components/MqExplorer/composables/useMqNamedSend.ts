import { computed, ref } from 'vue'
import { fetchMqConfig, sendNamedMqMessage } from '../api'
import type { UseMqNamedSendReturn } from '../types'

/** Manages state and logic for sending a message via a named pre-configured MQ connection. */
export function useMqNamedSend(): UseMqNamedSendReturn {
  const mqNames = ref<string[]>([])
  const selectedName = ref('')
  const searchQuery = ref('')
  const message = ref('')
  const delimiter = ref('')
  const response = ref<unknown>(null)
  const isLoading = ref(false)
  const sendError = ref<string | null>(null)
  const configError = ref<string | null>(null)
  const isConfigLoading = ref(false)

  const filteredNames = computed(() =>
    mqNames.value.filter(n => n.toLowerCase().includes(searchQuery.value.toLowerCase())),
  )

  const canSend = computed(() => selectedName.value.trim() !== '' && message.value.trim() !== '')

  async function loadConfig(): Promise<void> {
    configError.value = null
    isConfigLoading.value = true
    try {
      const cfg = await fetchMqConfig()
      mqNames.value = cfg.mqNames
    } catch (e) {
      configError.value = e instanceof Error ? e.message : 'Failed to load MQ config'
    } finally {
      isConfigLoading.value = false
    }
  }

  function selectName(name: string): void {
    selectedName.value = name
    searchQuery.value = ''
  }

  async function send(): Promise<void> {
    sendError.value = null
    isLoading.value = true
    try {
      response.value = await sendNamedMqMessage(
        selectedName.value,
        message.value,
        delimiter.value || undefined,
      )
    } catch (e) {
      sendError.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  return {
    mqNames,
    selectedName,
    searchQuery,
    filteredNames,
    message,
    delimiter,
    response,
    isLoading,
    sendError,
    configError,
    isConfigLoading,
    canSend,
    loadConfig,
    selectName,
    send,
  }
}
