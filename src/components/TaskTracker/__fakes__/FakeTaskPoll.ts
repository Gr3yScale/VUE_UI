import { ref } from 'vue'
import { vi } from 'vitest'
import type { UseTaskPollReturn, PollEntry } from '../types'

/** Test fake for `UseTaskPollReturn`. State refs are real; methods are `vi.fn()`. */
export class FakeTaskPoll implements UseTaskPollReturn {
  entries = ref<PollEntry[]>([])
  isPolling = ref(false)
  isStopped = ref(false)
  error = ref<string | null>(null)

  start = vi.fn(() => { this.isPolling.value = true })
  pause = vi.fn(() => { this.isPolling.value = false })
  cancel = vi.fn(async () => {
    this.isPolling.value = false
    this.isStopped.value = true
  })

  /** Seeds a poll entry directly into `entries`. */
  seedEntry(entry: PollEntry): void {
    this.entries.value = [...this.entries.value, entry]
  }

  /** Seeds multiple entries. */
  seedEntries(entries: PollEntry[]): void {
    this.entries.value = [...this.entries.value, ...entries]
  }
}
