import { ref } from 'vue'
import type { UseCreateTrackingReturn } from '../types'
import { createTrackingTask } from '../api'

/**
 * Manages form state and submission for a tracking task.
 * `servicesInput` is a comma-separated string that is parsed on submit.
 */
export function useCreateTracking(): UseCreateTrackingReturn {
  const servicesInput = ref('')
  const messageRef = ref('')
  const totalTimeoutMs = ref('30000')
  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)
  const createdTaskId = ref<string | null>(null)

  async function submit(): Promise<void> {
    submitError.value = null
    createdTaskId.value = null
    isSubmitting.value = true
    try {
      const services = servicesInput.value
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      const res = await createTrackingTask({
        services,
        messageRef: messageRef.value,
        totalTimeoutMs: parseInt(totalTimeoutMs.value, 10) || 30000,
      })
      createdTaskId.value = res.taskId
    } catch (e) {
      submitError.value = e instanceof Error ? e.message : 'Failed to create task'
    } finally {
      isSubmitting.value = false
    }
  }

  return { servicesInput, messageRef, totalTimeoutMs, isSubmitting, submitError, createdTaskId, submit }
}
