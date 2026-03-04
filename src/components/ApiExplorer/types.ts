/** HTTP verb for an API endpoint. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Content-type selection for the request body editor. */
export type ContentType = 'application/json' | 'application/xml' | 'text/plain' | 'none'

/** A named preset body for quick selection in the request editor. */
export interface ApiPreset {
  id: string
  name: string
  body: string
}

/** A single API endpoint within a source. */
export interface ApiEndpoint {
  id: string
  name: string
  method: HttpMethod
  path: string
  description: string
  defaultContentType: ContentType
  sampleBody?: string
  presets?: ApiPreset[]
}

/** A group of related API endpoints. */
export interface ApiSource {
  id: string
  name: string
  description: string
  baseUrl: string
  endpoints: ApiEndpoint[]
}

/** Response shape from `GET /api-explorer/metadata`. */
export interface ApiMetadataResponse {
  sources: ApiSource[]
}

/** A single editable header row in the request editor. */
export interface HeaderEntry {
  /** Stable key for `v-for` rendering. */
  id: string
  key: string
  value: string
  enabled: boolean
}

/** Payload sent to `POST /api-explorer/send`. */
export interface ApiSendRequest {
  sourceId: string
  endpointId: string
  body: string
  contentType: ContentType
  /** Only enabled, non-empty-key header entries. */
  headers: Record<string, string>
}

/** Parsed response returned by the stub server for a proxied request. */
export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  contentType: string
  elapsed: number
}
