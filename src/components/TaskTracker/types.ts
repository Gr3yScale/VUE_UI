import type { Ref } from 'vue'

export type DataSource = 'GPP_UK' | 'GPP_EU' | 'GPP_US'
export type QMSEnvironment = 'DEV' | 'SIT' | 'UAT' | 'PROD'
export type TaskType = 'INJECTION' | 'TRACKING'

/** Raw task status map returned by GET /task/{taskId}. */
export interface TaskStatusResult {
  taskId: string
  status?: string
  [key: string]: unknown
}

/** Response from DELETE /task/{taskId}. */
export interface StopTaskResponse {
  taskId: string
  stopped: boolean
  reason: string
  stoppedAt: string
  finalStatus: Record<string, unknown>
}

/** Response from GET /task/active. */
export interface ActiveTasksResponse {
  activeTaskIds: string[]
  count: number
  timestamp: string
}

/** Response from GET /task/stored. */
export interface StoredResultsResponse {
  storedResultIds: string[]
  count: number
  timestamp: string
}

/** Response from GET /task/inject/channels. */
export interface ChannelsResponse {
  source: DataSource
  environment: QMSEnvironment
  channels: string[]
  count: number
}

/** Request body for POST /task/inject/{source}. */
export interface InjectionTaskRequest {
  message: string
  channel: string
  env: QMSEnvironment
}

/** Request body for POST /task/track. */
export interface TrackingTaskRequest {
  services: string[]
  messageRef: string
  totalTimeoutMs: number
}

/** Response from POST /task/inject or POST /task/track. */
export interface TaskCreationResponse {
  taskId: string
  taskType: TaskType
  resultRetentionMs: number
  submittedAt: string
  source?: DataSource
  environment?: QMSEnvironment
  channel?: string
  services?: string[]
  messageRef?: string
  totalTimeoutMs?: number
}

/** A single snapshot captured during a polling cycle. */
export interface PollEntry {
  timestamp: string
  data: TaskStatusResult
  elapsedMs: number
}

/** Manages live polling for a single task. */
export interface UseTaskPollReturn {
  entries: Ref<PollEntry[]>
  isPolling: Ref<boolean>
  /** True when the task has reached a terminal state or been cancelled. */
  isStopped: Ref<boolean>
  error: Ref<string | null>
  /** Begins polling. No-op if already polling. */
  start(): void
  /** Halts the timer without cancelling the task. */
  pause(): void
  /** Halts the timer and calls DELETE /task/{taskId}. */
  cancel(): Promise<void>
}

/** Fetches the active and stored task ID lists. */
export interface UseTaskListReturn {
  activeTasks: Ref<string[]>
  storedTasks: Ref<string[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  refresh(): Promise<void>
}

/** Manages the payment injection task creation form. */
export interface UseCreateInjectionReturn {
  source: Ref<DataSource>
  env: Ref<QMSEnvironment>
  channel: Ref<string>
  message: Ref<string>
  channels: Ref<string[]>
  isLoadingChannels: Ref<boolean>
  isSubmitting: Ref<boolean>
  submitError: Ref<string | null>
  createdTaskId: Ref<string | null>
  submit(): Promise<void>
}

/** Manages the tracking task creation form. */
export interface UseCreateTrackingReturn {
  servicesInput: Ref<string>
  messageRef: Ref<string>
  totalTimeoutMs: Ref<string>
  isSubmitting: Ref<boolean>
  submitError: Ref<string | null>
  createdTaskId: Ref<string | null>
  submit(): Promise<void>
}
