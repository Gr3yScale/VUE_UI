import { ref, computed } from 'vue'
import { vi } from 'vitest'
import type { UseApiRequestReturn } from '../composables/useApiRequest'
import type { ContentType, HeaderEntry, ApiResponse, ApiSource, ApiEndpoint } from '../types'

/** Test fake that implements the full `UseApiRequestReturn` contract. */
export class FakeApiRequest implements UseApiRequestReturn {
  sourceId = ref('')
  endpointId = ref('')
  body = ref('')
  contentType = ref<ContentType>('none')
  headers = ref<HeaderEntry[]>([])
  response = ref<ApiResponse | null>(null)
  isLoading = ref(false)
  sendError = ref<string | null>(null)

  currentSource = computed<ApiSource | null>(() => null)
  currentEndpoint = computed<ApiEndpoint | null>(() => null)
  canSend = computed(() => this.sourceId.value.length > 0 && this.endpointId.value.length > 0)

  setSource = vi.fn()
  setEndpoint = vi.fn()
  setBody = vi.fn()
  setContentType = vi.fn()
  addHeader = vi.fn()
  removeHeader = vi.fn()
  updateHeader = vi.fn()
  toggleHeader = vi.fn()
  send = vi.fn(async () => {})
  clearResponse = vi.fn()

  /** Seeds a mock response into state. */
  seedResponse(r: ApiResponse): void {
    this.response.value = r
  }

  /** Simulates a send error. */
  simulateError(msg: string): void {
    this.sendError.value = msg
  }

  /** Simulates the loading state. */
  simulateLoading(v: boolean): void {
    this.isLoading.value = v
  }
}
