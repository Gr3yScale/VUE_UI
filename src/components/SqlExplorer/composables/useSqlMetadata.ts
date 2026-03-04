import { ref } from 'vue'
import type { Ref } from 'vue'
import type { SqlSource, SqlSampleQuery, SqlFlavor } from '../types'
import { fetchSqlMetadata } from '../api'

/** Fetches SQL metadata: sources, sample queries, and active flavor. */
export interface UseSqlMetadataReturn {
  sources: Ref<SqlSource[]>
  sampleQueries: Ref<SqlSampleQuery[]>
  flavor: Ref<SqlFlavor>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  /** Fetches `/sql/metadata` from the configured API base URL. */
  load(): Promise<void>
}

/** Loads SQL sources, sample queries, and flavor from the server metadata endpoint. */
export function useSqlMetadata(): UseSqlMetadataReturn {
  const sources = ref<SqlSource[]>([])
  const sampleQueries = ref<SqlSampleQuery[]>([])
  const flavor = ref<SqlFlavor>('PostgreSQL')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await fetchSqlMetadata()
      sources.value = data.sources
      sampleQueries.value = data.sampleQueries
      flavor.value = data.flavor
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  return { sources, sampleQueries, flavor, isLoading, error, load }
}
