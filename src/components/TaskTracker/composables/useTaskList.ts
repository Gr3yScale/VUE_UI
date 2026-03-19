import { ref } from 'vue'
import type { UseTaskListReturn } from '../types'
import { fetchActiveTasks, fetchStoredTasks } from '../api'

/**
 * Fetches active and stored task ID lists in parallel.
 * Call `refresh()` to reload.
 */
export function useTaskList(): UseTaskListReturn {
  const activeTasks = ref<string[]>([])
  const storedTasks = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function refresh(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [active, stored] = await Promise.all([fetchActiveTasks(), fetchStoredTasks()])
      activeTasks.value = active.activeTaskIds
      storedTasks.value = stored.storedResultIds
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load tasks'
    } finally {
      isLoading.value = false
    }
  }

  return { activeTasks, storedTasks, isLoading, error, refresh }
}
