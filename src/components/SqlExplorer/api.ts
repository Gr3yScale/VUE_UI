import { API_BASE_URL } from './config'
import type { SqlMetadataResponse, SqlQueryRequest, SqlQueryResponse } from './types'

function isSqlQueryResponse(val: unknown): val is SqlQueryResponse {
  if (typeof val !== 'object' || val === null) return false
  const v = val as Record<string, unknown>
  if (typeof v['data'] !== 'object' || v['data'] === null) return false
  const data = v['data'] as Record<string, unknown>
  return Array.isArray(data['columns']) && Array.isArray(data['rows'])
}

/**
 * Fetches SQL data sources, sample queries, and active database flavor.
 * Throws on non-2xx, network failure, or unexpected response shape.
 */
export async function fetchSqlMetadata(): Promise<SqlMetadataResponse> {
  const res = await fetch(`${API_BASE_URL}/sql/metadata`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json() as Promise<SqlMetadataResponse>
}

/**
 * Executes a paginated SQL query against the given source.
 * Throws on non-2xx, network failure, or unexpected response shape.
 */
export async function executeSqlQuery(body: SqlQueryRequest): Promise<SqlQueryResponse> {
  const res = await fetch(`${API_BASE_URL}/sql/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data: unknown = await res.json()
  if (!isSqlQueryResponse(data)) throw new Error('Unexpected response format from server')
  return data
}
