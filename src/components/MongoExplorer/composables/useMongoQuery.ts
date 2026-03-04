import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { MongoDocument, JsonEditorState, QueryEditorFields, PaginationState } from '../types'
import { usePagination, PAGE_SIZE } from './usePagination'
import { fetchQuery } from '../api'

/**
 * Manages the full lifecycle of a MongoExplorer session:
 * collection selection, query editing, data fetching, and pagination.
 *
 * All state is reactive. Components bind directly to exposed refs.
 */
export interface UseMongoQueryReturn {
  /** The currently selected MongoDB collection name. Empty string when none selected. */
  collection: Ref<string>
  /** Sets the active collection, clearing results and resetting pagination. */
  setCollection(name: string): void

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

  /** True when a collection is selected and all editors contain valid JSON. */
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

function emptyEditorState(): JsonEditorState {
  return { raw: '{}', isValid: true, error: null }
}

/** Manages query state, API communication, and orchestrates pagination. */
export function useMongoQuery(): UseMongoQueryReturn {
  const paging = usePagination()

  const collection = ref('')
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
      collection.value.trim().length > 0 &&
      editors.filter.value.isValid &&
      editors.sort.value.isValid &&
      editors.projection.value.isValid,
  )

  const pageSummary = computed(() => paging.pageSummary(totalMatches.value))

  function setCollection(name: string): void {
    collection.value = name
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
      const data = await fetchQuery({
        collection: collection.value,
        filter: JSON.parse(editors.filter.value.raw) as MongoDocument,
        sort: JSON.parse(editors.sort.value.raw) as MongoDocument,
        projection: JSON.parse(editors.projection.value.raw) as MongoDocument,
        offset,
        limit: PAGE_SIZE,
      })

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
    collection,
    setCollection,
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
