import { API_BASE_URL } from './config'
import type { MqConfigResponse, MqCustomSendRequest } from './types'

function isMqConfigResponse(data: unknown): data is MqConfigResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as MqConfigResponse).mqNames) &&
    typeof (data as MqConfigResponse).count === 'number'
  )
}

/** Fetches the list of pre-configured MQ names. */
export async function fetchMqConfig(): Promise<MqConfigResponse> {
  const res = await fetch(`${API_BASE_URL}/mq/config`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isMqConfigResponse(data)) throw new Error('Unexpected response format from /mq/config')
  return data
}

/** Sends a message via a custom MQ connection. Optionally includes a delimiter. */
export async function sendCustomMqMessage(
  req: MqCustomSendRequest,
  delimiter?: string,
): Promise<unknown> {
  const url = new URL(`${API_BASE_URL}/mq/send_custom`)
  if (delimiter) url.searchParams.set('delimiter', delimiter)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

/** Sends a message via a named pre-configured MQ connection. Optionally includes a delimiter. */
export async function sendNamedMqMessage(
  mqName: string,
  message: string,
  delimiter?: string,
): Promise<unknown> {
  const url = new URL(`${API_BASE_URL}/mq/send/${encodeURIComponent(mqName)}`)
  if (delimiter) url.searchParams.set('delimiter', delimiter)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}
