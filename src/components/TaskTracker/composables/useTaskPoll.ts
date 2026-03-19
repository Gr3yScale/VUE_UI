import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { PollEntry, UseTaskPollReturn } from '../types'
import { fetchTaskStatus, cancelTask } from '../api'
import { POLL_FAST_MS, POLL_SLOW_MS, POLL_FAST_DURATION_MS } from '../config'

const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED', 'STOPPED', 'ERROR'])

function isTerminalStatus(status: unknown): boolean {
  return typeof status === 'string' && TERMINAL_STATUSES.has(status)
}

/**
 * Polls GET /task/{taskId} on a two-phase schedule:
 * fast (every 500 ms) for the first 2 s, then slow (every 1 s) thereafter.
 * Accumulates all snapshots in `entries`. Auto-stops on terminal status.
 */
export function useTaskPoll(taskId: Ref<string>): UseTaskPollReturn {
  const entries = ref<PollEntry[]>([])
  const isPolling = ref(false)
  const isStopped = ref(false)
  const error = ref<string | null>(null)

  let timerHandle: ReturnType<typeof setTimeout> | null = null
  let startTime = 0
  let halted = false

  function clearTimer(): void {
    if (timerHandle !== null) {
      clearTimeout(timerHandle)
      timerHandle = null
    }
  }

  function scheduleNext(): void {
    const elapsed = Date.now() - startTime
    const delay = elapsed < POLL_FAST_DURATION_MS ? POLL_FAST_MS : POLL_SLOW_MS
    timerHandle = setTimeout(() => { void doPoll() }, delay)
  }

  async function doPoll(): Promise<void> {
    if (halted || !taskId.value) return
    try {
      const data = await fetchTaskStatus(taskId.value)
      if (halted) return
      entries.value = [
        ...entries.value,
        { timestamp: new Date().toISOString(), data, elapsedMs: Date.now() - startTime },
      ]
      if (isTerminalStatus(data.status)) {
        isPolling.value = false
        isStopped.value = true
      } else {
        scheduleNext()
      }
    } catch (e) {
      if (!halted) {
        error.value = e instanceof Error ? e.message : 'Poll failed'
        isPolling.value = false
      }
    }
  }

  function start(): void {
    if (isPolling.value || !taskId.value) return
    halted = false
    error.value = null
    isPolling.value = true
    isStopped.value = false
    startTime = Date.now()
    void doPoll()
  }

  function pause(): void {
    halted = true
    clearTimer()
    isPolling.value = false
  }

  async function cancel(): Promise<void> {
    halted = true
    clearTimer()
    isPolling.value = false
    try {
      await cancelTask(taskId.value)
    } catch {
      // best-effort: ignore cancel errors
    }
    isStopped.value = true
  }

  watch(taskId, () => {
    pause()
    entries.value = []
    isStopped.value = false
    error.value = null
  })

  onUnmounted(() => {
    halted = true
    clearTimer()
  })

  return { entries, isPolling, isStopped, error, start, pause, cancel }
}
