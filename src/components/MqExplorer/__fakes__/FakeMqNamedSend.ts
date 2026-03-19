import { computed, ref } from 'vue'
import { vi } from 'vitest'
import type { UseMqNamedSendReturn } from '../types'

/** Test fake for `useMqNamedSend`. Exposes seed helpers for assertions. */
export class FakeMqNamedSend implements UseMqNamedSendReturn {
  mqNames = ref<string[]>([])
  selectedName = ref('')
  searchQuery = ref('')
  filteredNames = computed(() =>
    this.mqNames.value.filter(n =>
      n.toLowerCase().includes(this.searchQuery.value.toLowerCase()),
    ),
  )
  message = ref('')
  delimiter = ref('')
  response = ref<unknown>(null)
  isLoading = ref(false)
  sendError = ref<string | null>(null)
  configError = ref<string | null>(null)
  isConfigLoading = ref(false)
  canSend = computed(() => this.selectedName.value !== '' && this.message.value !== '')

  loadConfig = vi.fn(async () => {})
  selectName = vi.fn((name: string) => {
    this.selectedName.value = name
  })
  send = vi.fn(async () => {})

  /** Seeds MQ names for assertions. */
  seedNames(...names: string[]): void {
    this.mqNames.value = names
  }

  /** Seeds a response for assertions. */
  seedResponse(r: unknown): void {
    this.response.value = r
  }
}
