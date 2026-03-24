import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve())
}
import { useTaskPoll } from './useTaskPoll'
import * as api from '../api'

vi.mock('../api')

const mockFetchTaskStatus = vi.mocked(api.fetchTaskStatus)
const mockCancelTask = vi.mocked(api.cancelTask)

function makeResult(status: string) {
  return { taskId: 'task-1', status }
}

async function tick() {
  await flushPromises()
  await nextTick()
}

describe('useTaskPoll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockFetchTaskStatus.mockResolvedValue(makeResult('RUNNING'))
    mockCancelTask.mockResolvedValue({
      taskId: 'task-1',
      stopped: true,
      reason: 'User requested cancellation',
      stoppedAt: new Date().toISOString(),
      finalStatus: {},
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('does not poll before start() is called', async () => {
    const taskId = ref('task-1')
    useTaskPoll(taskId)
    vi.advanceTimersByTime(5000)
    await tick()
    expect(mockFetchTaskStatus).not.toHaveBeenCalled()
  })

  it('polls immediately on start()', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    await tick()
    expect(mockFetchTaskStatus).toHaveBeenCalledWith('task-1')
    expect(poll.entries.value).toHaveLength(1)
    expect(poll.isPolling.value).toBe(true)
  })

  it('accumulates entries from each poll', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()

    await tick() // first poll
    expect(poll.entries.value).toHaveLength(1)

    vi.advanceTimersByTime(500) // fire next scheduled timer
    await tick() // second poll
    expect(poll.entries.value).toHaveLength(2)
  })

  it('uses fast interval during first POLL_FAST_DURATION_MS', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()

    // Initial poll
    await tick()
    expect(poll.entries.value).toHaveLength(1)

    // 3 more fast polls at 500ms, 1000ms, 1500ms
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(500)
      await tick()
    }
    expect(poll.entries.value).toHaveLength(4)
    expect(mockFetchTaskStatus).toHaveBeenCalledTimes(4)
  })

  it('transitions to slow interval after POLL_FAST_DURATION_MS', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()

    // Advance through fast phase
    await tick()
    vi.advanceTimersByTime(2500) // past fast phase boundary
    await tick()

    const countBeforeSlow = poll.entries.value.length

    // One slow interval fires
    vi.advanceTimersByTime(1000)
    await tick()
    expect(poll.entries.value.length).toBe(countBeforeSlow + 1)

    // 500ms should NOT fire another poll (slow interval is 1000ms)
    vi.advanceTimersByTime(500)
    await tick()
    expect(poll.entries.value.length).toBe(countBeforeSlow + 1)
  })

  it('auto-stops on terminal status', async () => {
    mockFetchTaskStatus.mockResolvedValueOnce(makeResult('RUNNING'))
    mockFetchTaskStatus.mockResolvedValueOnce(makeResult('COMPLETED'))

    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()

    await tick()
    expect(poll.isPolling.value).toBe(true)
    expect(poll.isStopped.value).toBe(false)

    vi.advanceTimersByTime(500)
    await tick()
    expect(poll.isPolling.value).toBe(false)
    expect(poll.isStopped.value).toBe(true)

    // No more polls after terminal
    const callCount = mockFetchTaskStatus.mock.calls.length
    vi.advanceTimersByTime(5000)
    await tick()
    expect(mockFetchTaskStatus.mock.calls.length).toBe(callCount)
  })

  it('pause() halts polling without calling DELETE', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    await tick()

    poll.pause()
    expect(poll.isPolling.value).toBe(false)
    expect(poll.isStopped.value).toBe(false)

    const callCount = mockFetchTaskStatus.mock.calls.length
    vi.advanceTimersByTime(5000)
    await tick()
    expect(mockFetchTaskStatus.mock.calls.length).toBe(callCount)
    expect(mockCancelTask).not.toHaveBeenCalled()
  })

  it('cancel() halts polling and calls DELETE', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    await tick()

    await poll.cancel()
    expect(mockCancelTask).toHaveBeenCalledWith('task-1')
    expect(poll.isPolling.value).toBe(false)
    expect(poll.isStopped.value).toBe(true)

    const callCount = mockFetchTaskStatus.mock.calls.length
    vi.advanceTimersByTime(5000)
    await tick()
    expect(mockFetchTaskStatus.mock.calls.length).toBe(callCount)
  })

  it('sets error and stops polling on fetch failure', async () => {
    mockFetchTaskStatus.mockRejectedValue(new Error('Network error'))
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    await tick()

    expect(poll.error.value).toBe('Network error')
    expect(poll.isPolling.value).toBe(false)
  })

  it('resets entries and state when taskId changes', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    await tick()
    expect(poll.entries.value.length).toBeGreaterThan(0)

    taskId.value = 'task-2'
    await nextTick()
    expect(poll.entries.value).toHaveLength(0)
    expect(poll.isPolling.value).toBe(false)
    expect(poll.isStopped.value).toBe(false)
  })

  it('start() is a no-op if already polling', async () => {
    const taskId = ref('task-1')
    const poll = useTaskPoll(taskId)
    poll.start()
    poll.start() // second call should be ignored
    await tick()
    expect(mockFetchTaskStatus).toHaveBeenCalledTimes(1)
  })
})
