import { API_BASE_URL } from './config'
import type {
  DataSource,
  QMSEnvironment,
  TaskStatusResult,
  StopTaskResponse,
  ActiveTasksResponse,
  StoredResultsResponse,
  ChannelsResponse,
  InjectionTaskRequest,
  TrackingTaskRequest,
  TaskCreationResponse,
} from './types'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  const data: unknown = await res.json()
  return data as T
}

function isTaskStatusResult(data: unknown): data is TaskStatusResult {
  return typeof data === 'object' && data !== null && 'taskId' in data
}

function isStopTaskResponse(data: unknown): data is StopTaskResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'taskId' in data &&
    'stopped' in data &&
    'reason' in data
  )
}

function isActiveTasksResponse(data: unknown): data is ActiveTasksResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'activeTaskIds' in data &&
    Array.isArray((data as ActiveTasksResponse).activeTaskIds)
  )
}

function isStoredResultsResponse(data: unknown): data is StoredResultsResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'storedResultIds' in data &&
    Array.isArray((data as StoredResultsResponse).storedResultIds)
  )
}

function isChannelsResponse(data: unknown): data is ChannelsResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'channels' in data &&
    Array.isArray((data as ChannelsResponse).channels)
  )
}

function isTaskCreationResponse(data: unknown): data is TaskCreationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'taskId' in data &&
    'taskType' in data
  )
}

/** Fetches the current status snapshot for a task. */
export async function fetchTaskStatus(taskId: string): Promise<TaskStatusResult> {
  const data = await request<unknown>(`/task/${encodeURIComponent(taskId)}`)
  if (!isTaskStatusResult(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Cancels a running task. */
export async function cancelTask(taskId: string, reason?: string): Promise<StopTaskResponse> {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
  const data = await request<unknown>(`/task/${encodeURIComponent(taskId)}${params}`, {
    method: 'DELETE',
  })
  if (!isStopTaskResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Returns the list of currently active task IDs. */
export async function fetchActiveTasks(): Promise<ActiveTasksResponse> {
  const data = await request<unknown>('/task/active')
  if (!isActiveTasksResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Returns the list of stored (completed) task IDs. */
export async function fetchStoredTasks(): Promise<StoredResultsResponse> {
  const data = await request<unknown>('/task/stored')
  if (!isStoredResultsResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Returns available channels for the given source and environment. */
export async function fetchChannels(
  source: DataSource,
  env: QMSEnvironment,
): Promise<ChannelsResponse> {
  const data = await request<unknown>(
    `/task/inject/channels?source=${source}&env=${env}`,
  )
  if (!isChannelsResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Creates a payment injection task. */
export async function createInjectionTask(
  source: DataSource,
  body: InjectionTaskRequest,
  retentionMs?: number,
): Promise<TaskCreationResponse> {
  const params = retentionMs != null ? `?resultRetentionMs=${retentionMs}` : ''
  const data = await request<unknown>(`/task/inject/${source}${params}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!isTaskCreationResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/** Creates a tracking task. */
export async function createTrackingTask(
  body: TrackingTaskRequest,
  retentionMs?: number,
): Promise<TaskCreationResponse> {
  const params = retentionMs != null ? `?resultRetentionMs=${retentionMs}` : ''
  const data = await request<unknown>(`/task/track${params}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!isTaskCreationResponse(data)) throw new Error('Unexpected response format from server')
  return data
}
