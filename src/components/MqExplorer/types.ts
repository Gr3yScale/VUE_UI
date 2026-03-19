import type { ComputedRef, Ref } from 'vue'

/** Response from the MQ config endpoint. */
export interface MqConfigResponse {
  mqNames: string[]
  count: number
}

/** Payload for a custom MQ send request. */
export interface MqCustomSendRequest {
  host: string
  port: number
  channel: string
  queueManager: string
  queueName: string
  message: string
}

/** Composable return shape for custom MQ send. */
export interface UseMqCustomSendReturn {
  host: Ref<string>
  port: Ref<string>
  channel: Ref<string>
  queueManager: Ref<string>
  queueName: Ref<string>
  message: Ref<string>
  delimiter: Ref<string>
  response: Ref<unknown>
  isLoading: Ref<boolean>
  sendError: Ref<string | null>
  canSend: ComputedRef<boolean>
  send(): Promise<void>
}

/** Composable return shape for named MQ send. */
export interface UseMqNamedSendReturn {
  mqNames: Ref<string[]>
  selectedName: Ref<string>
  searchQuery: Ref<string>
  filteredNames: ComputedRef<string[]>
  message: Ref<string>
  delimiter: Ref<string>
  response: Ref<unknown>
  isLoading: Ref<boolean>
  sendError: Ref<string | null>
  configError: Ref<string | null>
  isConfigLoading: Ref<boolean>
  canSend: ComputedRef<boolean>
  loadConfig(): Promise<void>
  selectName(name: string): void
  send(): Promise<void>
}
