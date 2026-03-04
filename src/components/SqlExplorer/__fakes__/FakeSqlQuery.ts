import { ref, computed } from 'vue'
import { vi } from 'vitest'
import type { UseSqlQueryReturn } from '../composables/useSqlQuery'

/** Test fake that implements the full `UseSqlQueryReturn` contract. */
export class FakeSqlQuery implements UseSqlQueryReturn {
  source = ref('')
  sql = ref('')
  columns = ref<string[]>([])
  rows = ref<unknown[][]>([])
  isLoading = ref(false)
  fetchError = ref<string | null>(null)

  canQuery = computed(() => this.source.value.length > 0 && this.sql.value.length > 0)
  hasMore = computed(() => false)
  rowCount = computed(() => this.rows.value.length)

  setSource = vi.fn((name: string) => { this.source.value = name })
  setSql = vi.fn((text: string) => { this.sql.value = text })
  runQuery = vi.fn(async () => { /* no-op by default */ })
  loadMore = vi.fn(async () => { /* no-op by default */ })

  /** Seeds column and row data for inspection in tests. */
  seedResults(cols: string[], data: unknown[][]): void {
    this.columns.value = cols
    this.rows.value = data
  }

  /** Simulates an API error state. */
  simulateError(msg: string): void {
    this.fetchError.value = msg
    this.rows.value = []
  }

  /** Simulates the loading state. */
  simulateLoading(value: boolean): void {
    this.isLoading.value = value
  }
}
