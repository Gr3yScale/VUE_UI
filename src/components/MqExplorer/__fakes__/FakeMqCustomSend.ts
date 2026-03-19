import { computed, ref } from 'vue'
import { vi } from 'vitest'
import type { UseMqCustomSendReturn } from '../types'

/** Test fake for `useMqCustomSend`. Exposes seed helpers for assertions. */
export class FakeMqCustomSend implements UseMqCustomSendReturn {
  host = ref('')
  port = ref('')
  channel = ref('')
  queueManager = ref('')
  queueName = ref('')
  message = ref('')
  delimiter = ref('')
  response = ref<unknown>(null)
  isLoading = ref(false)
  sendError = ref<string | null>(null)
  canSend = computed(
    () =>
      this.host.value !== '' &&
      this.port.value !== '' &&
      this.channel.value !== '' &&
      this.queueManager.value !== '' &&
      this.queueName.value !== '' &&
      this.message.value !== '',
  )

  send = vi.fn(async () => {})

  /** Seeds a response for assertions. */
  seedResponse(r: unknown): void {
    this.response.value = r
  }
}
