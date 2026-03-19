import { ref } from 'vue'
import { vi } from 'vitest'
import type { UseTaskListReturn } from '../types'

/** Test fake for `UseTaskListReturn`. State refs are real; `refresh` is `vi.fn()`. */
export class FakeTaskList implements UseTaskListReturn {
  activeTasks = ref<string[]>([])
  storedTasks = ref<string[]>([])
  isLoading = ref(false)
  error = ref<string | null>(null)

  refresh = vi.fn(async () => {})

  /** Seeds the active and stored task ID lists. */
  seed(active: string[], stored: string[]): void {
    this.activeTasks.value = active
    this.storedTasks.value = stored
  }
}
