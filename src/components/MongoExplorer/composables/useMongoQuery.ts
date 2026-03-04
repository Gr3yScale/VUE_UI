import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type {
  MongoDocument,
  QueryResponse,
  JsonEditorState,
  QueryEditorFields,
  PaginationState,
} from '../types'
import { usePagination, PAGE_SIZE } from './usePagination'

/**
 * Manages the full lifecycle of a MongoExplorer session:
 * endpoint configuration, query editing, data fetching, and pagination.
 *
 * All state is reactive. Components bind directly to exposed refs.
 */
export interface UseMongoQueryReturn {
  endpointUrl: Ref<string>
  /** Updates the endpoint URL and resets results and pagination. */
  setEndpointUrl(url: string): void

  editors: {
    filter: Ref<JsonEditorState>
    sort: Ref<JsonEditorState>
    projection: Ref<JsonEditorState>
  }
  /**
   * Updates the raw text for a given editor field and re-validates JSON.
   * Runs live on every keystroke.
   */
  updateEditor(field: keyof QueryEditorFields, raw: string): void
  /** Resets all three editors to `{}` and clears pagination. */
  resetEditors(): void

  /** True when endpoint is non-empty and all editors contain valid JSON. */
  canQuery: ComputedRef<boolean>
  /** Executes a fresh query (page 1), resetting pagination first. */
  runQuery(): Promise<void>
  /** Fetches the next page. No-op if `hasNext` is false. */
  nextPage(): Promise<void>
  /** Fetches the previous page. No-op if on page 1. */
  prevPage(): Promise<void>

  /** Current page of result documents. */
  results: Ref<MongoDocument[]>
  /** Total matching document count from the last response. */
  totalMatches: Ref<number>
  isLoading: Ref<boolean>
  fetchError: Ref<string | null>

  /** Read-only pagination state for template bindings. */
  pagination: Readonly<Ref<PaginationState>>
  /** Human-readable page summary updated after each fetch. */
  pageSummary: ComputedRef<string>
}

function validateJson(raw: string): JsonEditorState {
  if (raw.trim() === '') {
    return { raw, isValid: false, error: 'Field cannot be empty' }
  }
  try {
    JSON.parse(raw)
    return { raw, isValid: true, error: null }
  } catch (e) {
    return { raw, isValid: false, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

function isQueryResponse(val: unknown): val is QueryResponse {
  return (
    typeof val === 'object' &&
    val !== null &&
    'data' in val &&
    Array.isArray((val as QueryResponse).data) &&
    'finalOffset' in val &&
    'totalMatches' in val &&
    typeof (val as QueryResponse).totalMatches === 'number'
  )
}

function emptyEditorState(): JsonEditorState {
  return { raw: '{}', isValid: true, error: null }
}

/** Manages query state, API communication, and orchestrates pagination. */
export function useMongoQuery(): UseMongoQueryReturn {
  const paging = usePagination()

  const endpointUrl = ref('')
  const editors = {
    filter: ref<JsonEditorState>(emptyEditorState()),
    sort: ref<JsonEditorState>(emptyEditorState()),
    projection: ref<JsonEditorState>(emptyEditorState()),
  }
  const results = ref<MongoDocument[]>([])
  const totalMatches = ref(0)
  const isLoading = ref(false)
  const fetchError = ref<string | null>(null)
  const lastFinalOffset = ref<string | null>(null)

  const canQuery = computed(
    () =>
      endpointUrl.value.trim().length > 0 &&
      editors.filter.value.isValid &&
      editors.sort.value.isValid &&
      editors.projection.value.isValid,
  )

  const pageSummary = computed(() => paging.pageSummary(totalMatches.value))

  function setEndpointUrl(url: string): void {
    endpointUrl.value = url
    results.value = []
    totalMatches.value = 0
    fetchError.value = null
    paging.reset()
  }

  function updateEditor(field: keyof QueryEditorFields, raw: string): void {
    editors[field].value = validateJson(raw)
  }

  function resetEditors(): void {
    editors.filter.value = emptyEditorState()
    editors.sort.value = emptyEditorState()
    editors.projection.value = emptyEditorState()
    results.value = []
    totalMatches.value = 0
    fetchError.value = null
    paging.reset()
  }

  async function fetchPage(offset: string | null): Promise<void> {
    isLoading.value = true
    fetchError.value = null
    results.value = []

    try {
      const body = {
        filter: JSON.parse(editors.filter.value.raw) as MongoDocument,
        sort: JSON.parse(editors.sort.value.raw) as MongoDocument,
        projection: JSON.parse(editors.projection.value.raw) as MongoDocument,
        offset,
        limit: PAGE_SIZE,
      }

      const response = await fetch(endpointUrl.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text()
        fetchError.value = `HTTP ${response.status}: ${text}`
        return
      }

      const data: unknown = await response.json()

      if (!isQueryResponse(data)) {
        fetchError.value = 'Unexpected response format from server'
        return
      }

      results.value = data.data
      totalMatches.value = data.totalMatches
      lastFinalOffset.value = data.finalOffset
      paging.setHasNext(data.finalOffset !== null)
    } catch (e) {
      fetchError.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  async function runQuery(): Promise<void> {
    paging.reset()
    await fetchPage(null)
  }

  async function nextPage(): Promise<void> {
    if (!paging.state.value.hasNext || lastFinalOffset.value === null) return
    const nextOffset = lastFinalOffset.value
    paging.goToNext(nextOffset)
    await fetchPage(nextOffset)
  }

  async function prevPage(): Promise<void> {
    if (paging.state.value.currentPage === 0) return
    paging.goToPrev()
    await fetchPage(paging.currentOffset())
  }

  return {
    endpointUrl,
    setEndpointUrl,
    editors,
    updateEditor,
    resetEditors,
    canQuery,
    runQuery,
    nextPage,
    prevPage,
    results,
    totalMatches,
    isLoading,
    fetchError,
    pagination: paging.state,
    pageSummary,
  }
}
