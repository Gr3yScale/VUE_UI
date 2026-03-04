import { ref } from 'vue'
import type { Ref } from 'vue'
import type { SampleQuery } from '../types'
import { fetchMetadata } from '../api'

/**
 * Fetches collection metadata and sample queries from the stub server.
 */
export interface UseMetadataReturn {
  collections: Ref<string[]>
  sampleQueries: Ref<SampleQuery[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  /** Fetches `/metadata` from the configured API base URL. */
  load(): Promise<void>
}

/** Loads collection names and sample queries from the server metadata endpoint. */
export function useMetadata(): UseMetadataReturn {
  const collections = ref<string[]>([])
  const sampleQueries = ref<SampleQuery[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await fetchMetadata()
      collections.value = data.collections
      sampleQueries.value = data.sampleQueries
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  return { collections, sampleQueries, isLoading, error, load }
}
