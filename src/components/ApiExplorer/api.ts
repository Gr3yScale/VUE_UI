import { API_BASE_URL } from './config'
import type { ApiMetadataResponse, ApiSendRequest, ApiResponse, ApiSource, ApiEndpoint } from './types'

function isApiEndpoint(val: unknown): val is ApiEndpoint {
  if (typeof val !== 'object' || val === null) return false
  const v = val as Record<string, unknown>
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['method'] === 'string' &&
    typeof v['path'] === 'string' &&
    typeof v['description'] === 'string' &&
    typeof v['defaultContentType'] === 'string'
  )
}

function isApiSource(val: unknown): val is ApiSource {
  if (typeof val !== 'object' || val === null) return false
  const v = val as Record<string, unknown>
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['description'] === 'string' &&
    typeof v['baseUrl'] === 'string' &&
    Array.isArray(v['endpoints']) &&
    (v['endpoints'] as unknown[]).every(isApiEndpoint)
  )
}

function isApiMetadataResponse(val: unknown): val is ApiMetadataResponse {
  if (typeof val !== 'object' || val === null) return false
  const v = val as Record<string, unknown>
  return Array.isArray(v['sources']) && (v['sources'] as unknown[]).every(isApiSource)
}

function isApiResponse(val: unknown): val is ApiResponse {
  if (typeof val !== 'object' || val === null) return false
  const v = val as Record<string, unknown>
  return (
    typeof v['status'] === 'number' &&
    typeof v['statusText'] === 'string' &&
    typeof v['body'] === 'string' &&
    typeof v['elapsed'] === 'number' &&
    typeof v['headers'] === 'object' &&
    v['headers'] !== null
  )
}

/** Fetches all API sources and their endpoints from the stub server. */
export async function fetchApiMetadata(): Promise<ApiMetadataResponse> {
  const res = await fetch(`${API_BASE_URL}/api-explorer/metadata`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isApiMetadataResponse(data)) throw new Error('Unexpected response format from server')
  return data
}

/**
 * Sends a configured API request through the stub server proxy.
 * 4xx/5xx from the mocked target are returned as `ApiResponse` (not thrown).
 * Only proxy-level failure (stub server non-2xx) throws.
 */
export async function sendApiRequest(req: ApiSendRequest): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE_URL}/api-explorer/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isApiResponse(data)) throw new Error('Unexpected response format from server')
  return {
    status: data.status,
    statusText: data.statusText,
    headers: data.headers as Record<string, string>,
    body: data.body,
    contentType: (data.headers as Record<string, string>)['content-type'] ?? '',
    elapsed: data.elapsed,
  }
}
