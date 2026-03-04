import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { vi } from 'vitest'
import type { UseMongoQueryReturn } from '../composables/useMongoQuery'
import type { MongoDocument, JsonEditorState, QueryEditorFields, PaginationState } from '../types'

function emptyEditor(): JsonEditorState {
  return { raw: '{}', isValid: true, error: null }
}

function initialPagination(): PaginationState {
  return { offsets: [null], currentPage: 0, hasNext: false }
}

/** Test fake that implements the full `UseMongoQueryReturn` contract. */
export class FakeMongoQuery implements UseMongoQueryReturn {
  endpointUrl = ref('')
  editors = {
    filter: ref<JsonEditorState>(emptyEditor()),
    sort: ref<JsonEditorState>(emptyEditor()),
    projection: ref<JsonEditorState>(emptyEditor()),
  }
  results = ref<MongoDocument[]>([])
  totalMatches = ref(0)
  isLoading = ref(false)
  fetchError = ref<string | null>(null)
  pagination = ref<PaginationState>(initialPagination()) as Readonly<Ref<PaginationState>>
  canQuery = computed(() => this.endpointUrl.value.length > 0)
  pageSummary = computed(() => `Page 1 | Showing 1–100 of ${this.totalMatches.value} matches`)

  setEndpointUrl = vi.fn((url: string) => { this.endpointUrl.value = url })
  updateEditor = vi.fn((field: keyof QueryEditorFields, raw: string) => {
    this.editors[field].value = { raw, isValid: true, error: null }
  })
  resetEditors = vi.fn(() => {
    this.editors.filter.value = emptyEditor()
    this.editors.sort.value = emptyEditor()
    this.editors.projection.value = emptyEditor()
    this.results.value = []
  })
  runQuery = vi.fn(async () => { /* no-op by default */ })
  nextPage = vi.fn(async () => { /* no-op by default */ })
  prevPage = vi.fn(async () => { /* no-op by default */ })

  /** Seeds result documents for inspection in tests. */
  seedResults(...docs: MongoDocument[]): void {
    this.results.value = docs
    this.totalMatches.value = docs.length
  }

  /** Simulates an API error state. */
  simulateError(message: string): void {
    this.fetchError.value = message
    this.results.value = []
  }

  /** Simulates the loading state. */
  simulateLoading(value: boolean): void {
    this.isLoading.value = value
  }
}
