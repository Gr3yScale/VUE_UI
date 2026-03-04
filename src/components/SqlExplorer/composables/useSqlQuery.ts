import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { executeSqlQuery } from '../api'
import { PAGE_SIZE, MAX_ROWS } from '../config'

/**
 * Manages the full lifecycle of a SQL query session:
 * source selection, SQL editing, data fetching, and infinite scroll pagination.
 */
export interface UseSqlQueryReturn {
  /** Currently selected source ID. Empty string when none selected. */
  source: Ref<string>
  /** Sets the active source, clearing all results and pagination state. */
  setSource(name: string): void

  /** Current SQL text in the editor. */
  sql: Ref<string>
  /** Updates the SQL text. */
  setSql(text: string): void

  /** Column names from the last response. */
  columns: Ref<string[]>
  /** Accumulated row data across all loaded pages. */
  rows: Ref<unknown[][]>

  isLoading: Ref<boolean>
  fetchError: Ref<string | null>

  /** True when a source is selected and sql is non-empty. */
  canQuery: ComputedRef<boolean>
  /** True when more pages are available and MAX_ROWS has not been reached. */
  hasMore: ComputedRef<boolean>
  /** Total number of rows currently loaded. */
  rowCount: ComputedRef<number>

  /** Executes a fresh query, resetting all state. */
  runQuery(): Promise<void>
  /** Fetches the next page and appends to existing rows. No-op if `hasMore` is false. */
  loadMore(): Promise<void>
}

/** Manages SQL query state, API communication, and infinite scroll pagination. */
export function useSqlQuery(): UseSqlQueryReturn {
  const source = ref('')
  const sql = ref('')
  const columns = ref<string[]>([])
  const rows = ref<unknown[][]>([])
  const isLoading = ref(false)
  const fetchError = ref<string | null>(null)
  const nextOffset = ref<string | null>(null)

  const canQuery = computed(() => source.value.trim().length > 0 && sql.value.trim().length > 0)
  const hasMore = computed(() => nextOffset.value !== null && rows.value.length < MAX_ROWS)
  const rowCount = computed(() => rows.value.length)

  function setSource(name: string): void {
    source.value = name
    columns.value = []
    rows.value = []
    fetchError.value = null
    nextOffset.value = null
  }

  function setSql(text: string): void {
    sql.value = text
  }

  async function fetchPage(offset: string | null, append: boolean): Promise<void> {
    isLoading.value = true
    fetchError.value = null
    if (!append) {
      columns.value = []
      rows.value = []
      nextOffset.value = null
    }

    try {
      const data = await executeSqlQuery({
        source: source.value,
        sql: sql.value,
        offset,
        limit: PAGE_SIZE,
      })

      columns.value = data.data.columns
      if (append) {
        rows.value = [...rows.value, ...data.data.rows]
      } else {
        rows.value = data.data.rows
      }
      nextOffset.value = data.offset
    } catch (e) {
      fetchError.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      isLoading.value = false
    }
  }

  async function runQuery(): Promise<void> {
    await fetchPage(null, false)
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoading.value) return
    await fetchPage(nextOffset.value, true)
  }

  return {
    source,
    setSource,
    sql,
    setSql,
    columns,
    rows,
    isLoading,
    fetchError,
    canQuery,
    hasMore,
    rowCount,
    runQuery,
    loadMore,
  }
}
