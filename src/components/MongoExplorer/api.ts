import { API_BASE_URL } from './config'
import type { QueryRequest, QueryResponse, MetadataResponse } from './types'

function isQueryResponse(val: unknown): val is QueryResponse {
  return (
    typeof val === 'object' &&
    val !== null &&
    Array.isArray((val as QueryResponse).data) &&
    'finalOffset' in val &&
    typeof (val as QueryResponse).totalMatches === 'number'
  )
}

/**
 * Fetches collection names and pre-built sample queries from the server.
 * Throws on non-2xx, network failure, or unexpected response shape.
 */
export async function fetchMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${API_BASE_URL}/metadata`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json() as Promise<MetadataResponse>
}

/**
 * Executes a paginated collection query.
 * Throws on non-2xx, network failure, or unexpected response shape.
 */
export async function fetchQuery(body: QueryRequest): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isQueryResponse(data)) throw new Error('Unexpected response format from server')
  return data
}
