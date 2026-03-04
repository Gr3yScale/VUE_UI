import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ApiSource } from '../types'
import { fetchApiMetadata } from '../api'

/** Fetches and holds the list of available API sources. */
export interface UseApiMetadataReturn {
  sources: Ref<ApiSource[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  /** Fetches `/api-explorer/metadata` from the configured API base URL. */
  load(): Promise<void>
}

/** Loads API sources from the server metadata endpoint. */
export function useApiMetadata(): UseApiMetadataReturn {
  const sources = ref<ApiSource[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await fetchApiMetadata()
      sources.value = data.sources
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  return { sources, isLoading, error, load }
}
