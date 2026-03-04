import { ref } from 'vue'
import type { Ref } from 'vue'
import type { PaginationState } from '../types'

const PAGE_SIZE = 100

/**
 * Manages cursor-based pagination state for the MongoExplorer.
 *
 * The offsets array stores the starting cursor for each page:
 * `[null, "abc", "cde"]` means page 1 starts at null, page 2 at "abc", etc.
 */
export interface UsePaginationReturn {
  /** Reactive pagination state (read-only to consumers). */
  state: Readonly<Ref<PaginationState>>
  /**
   * Advances to the next page using the finalOffset from the last response.
   * Only appends `nextOffset` to the offsets array if this page is not already known.
   */
  goToNext(nextOffset: string): void
  /**
   * Moves back to the previous page. No-op if already on page 1.
   */
  goToPrev(): void
  /** Returns the offset token for the current page to use in the next request. */
  currentOffset(): string | null
  /** Updates whether a next page is known to exist. Called by `useMongoQuery` after each response. */
  setHasNext(value: boolean): void
  /** Resets pagination to page 1. Call this whenever the query changes. */
  reset(): void
  /**
   * Human-readable page summary string.
   * @example "Page 3 | Showing 200–300 of 11,231,231 matches"
   */
  pageSummary(totalMatches: number): string
}

/** Fixed number of documents per page. */
export { PAGE_SIZE }

/** Creates a fresh pagination state starting at page 1. */
function initialState(): PaginationState {
  return { offsets: [null], currentPage: 0, hasNext: false }
}

/** Manages cursor-based pagination — no API knowledge, pure offset-array logic. */
export function usePagination(): UsePaginationReturn {
  const state = ref<PaginationState>(initialState())

  function goToNext(nextOffset: string): void {
    const nextPage = state.value.currentPage + 1
    // Only append if we don't already know this page's offset
    if (state.value.offsets.length <= nextPage) {
      state.value.offsets.push(nextOffset)
    }
    state.value.currentPage = nextPage
  }

  function goToPrev(): void {
    if (state.value.currentPage === 0) return
    state.value.currentPage -= 1
  }

  function currentOffset(): string | null {
    return state.value.offsets[state.value.currentPage] ?? null
  }

  function setHasNext(value: boolean): void {
    state.value.hasNext = value
  }

  function reset(): void {
    state.value = initialState()
  }

  function pageSummary(totalMatches: number): string {
    const fmt = new Intl.NumberFormat()
    const page = state.value.currentPage
    const from = page * PAGE_SIZE + 1
    const to = page * PAGE_SIZE + PAGE_SIZE
    return `Page ${page + 1} | Showing ${fmt.format(from)}–${fmt.format(to)} of ${fmt.format(totalMatches)} matches`
  }

  return {
    state: state as Readonly<Ref<PaginationState>>,
    goToNext,
    goToPrev,
    currentOffset,
    setHasNext,
    reset,
    pageSummary,
  }
}
