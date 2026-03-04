import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { ApiSource, ApiEndpoint, ContentType, HeaderEntry, ApiResponse } from '../types'
import { sendApiRequest } from '../api'

/** Full state and actions for building and sending an API request. */
export interface UseApiRequestReturn {
  sourceId: Ref<string>
  /** Sets the active source and resets endpoint, body, headers, and response. */
  setSource(id: string): void

  endpointId: Ref<string>
  /** Sets the active endpoint, auto-populating body, content-type, and clearing response. */
  setEndpoint(id: string): void

  body: Ref<string>
  setBody(text: string): void

  contentType: Ref<ContentType>
  setContentType(ct: ContentType): void

  headers: Ref<HeaderEntry[]>
  addHeader(): void
  removeHeader(idx: number): void
  updateHeader(idx: number, key: string, value: string): void
  toggleHeader(idx: number): void

  currentSource: ComputedRef<ApiSource | null>
  currentEndpoint: ComputedRef<ApiEndpoint | null>
  /** True when both `sourceId` and `endpointId` are set. */
  canSend: ComputedRef<boolean>

  response: Ref<ApiResponse | null>
  isLoading: Ref<boolean>
  sendError: Ref<string | null>

  /** Sends the current request and populates `response`. */
  send(): Promise<void>
  clearResponse(): void
}

let headerIdCounter = 0
function nextHeaderId(): string {
  return `h${++headerIdCounter}`
}

/**
 * Manages the full state of an API request: source/endpoint selection,
 * body editing, headers, and the resulting response.
 */
export function useApiRequest(sources: Ref<ApiSource[]>): UseApiRequestReturn {
  const sourceId = ref('')
  const endpointId = ref('')
  const body = ref('')
  const contentType = ref<ContentType>('none')
  const headers = ref<HeaderEntry[]>([])
  const response = ref<ApiResponse | null>(null)
  const isLoading = ref(false)
  const sendError = ref<string | null>(null)

  const currentSource = computed<ApiSource | null>(
    () => sources.value.find(s => s.id === sourceId.value) ?? null
  )

  const currentEndpoint = computed<ApiEndpoint | null>(
    () => currentSource.value?.endpoints.find(e => e.id === endpointId.value) ?? null
  )

  const canSend = computed(() => sourceId.value.length > 0 && endpointId.value.length > 0)

  function setSource(id: string): void {
    sourceId.value = id
    endpointId.value = ''
    body.value = ''
    contentType.value = 'none'
    headers.value = []
    response.value = null
    sendError.value = null
  }

  function setEndpoint(id: string): void {
    endpointId.value = id
    const endpoint = currentSource.value?.endpoints.find(e => e.id === id) ?? null
    if (endpoint) {
      body.value = endpoint.sampleBody ?? ''
      contentType.value = endpoint.defaultContentType
    }
    response.value = null
    sendError.value = null
  }

  function setBody(text: string): void {
    body.value = text
  }

  function setContentType(ct: ContentType): void {
    contentType.value = ct
  }

  function addHeader(): void {
    headers.value = [...headers.value, { id: nextHeaderId(), key: '', value: '', enabled: true }]
  }

  function removeHeader(idx: number): void {
    headers.value = headers.value.filter((_, i) => i !== idx)
  }

  function updateHeader(idx: number, key: string, value: string): void {
    headers.value = headers.value.map((h, i) => i === idx ? { ...h, key, value } : h)
  }

  function toggleHeader(idx: number): void {
    headers.value = headers.value.map((h, i) => i === idx ? { ...h, enabled: !h.enabled } : h)
  }

  function buildHeadersRecord(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const h of headers.value) {
      if (h.enabled && h.key.trim() !== '') {
        result[h.key.trim()] = h.value
      }
    }
    return result
  }

  async function send(): Promise<void> {
    isLoading.value = true
    sendError.value = null
    response.value = null
    try {
      const result = await sendApiRequest({
        sourceId: sourceId.value,
        endpointId: endpointId.value,
        body: body.value,
        contentType: contentType.value,
        headers: buildHeadersRecord(),
      })
      response.value = result
    } catch (e) {
      sendError.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  function clearResponse(): void {
    response.value = null
    sendError.value = null
  }

  return {
    sourceId,
    setSource,
    endpointId,
    setEndpoint,
    body,
    setBody,
    contentType,
    setContentType,
    headers,
    addHeader,
    removeHeader,
    updateHeader,
    toggleHeader,
    currentSource,
    currentEndpoint,
    canSend,
    response,
    isLoading,
    sendError,
    send,
    clearResponse,
  }
}
