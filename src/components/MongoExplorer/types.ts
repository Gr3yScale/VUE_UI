/**
 * A MongoDB-style query document — a plain JSON-serializable object.
 * Used for filter, sort, and projection fields.
 */
export type MongoDocument = Record<string, unknown>

/**
 * The request body sent to the user-configured API endpoint.
 */
export interface QueryRequest {
  /** The MongoDB collection name to query. */
  collection: string
  filter: MongoDocument
  sort: MongoDocument
  projection: MongoDocument
  /** Cursor offset for the current page. `null` means the first page. */
  offset: string | null
  /** Fixed page size. */
  limit: number
}

/**
 * A pre-built sample query shown in the SampleQueryPicker.
 */
export interface SampleQuery {
  id: string
  name: string
  /** Markdown content rendered in the SampleQueryPicker detail pane. */
  description: string
  collection: string
  filter: MongoDocument
  sort: MongoDocument
  projection: MongoDocument
}

/**
 * Response from the `GET /metadata` endpoint.
 */
export interface MetadataResponse {
  collections: string[]
  sampleQueries: SampleQuery[]
}

/**
 * The response returned by the user-configured API endpoint.
 */
export interface QueryResponse {
  /** The result documents for this page. */
  data: MongoDocument[]
  /**
   * The offset token to use when fetching the next page.
   * `null` if this is the last page.
   */
  finalOffset: string | null
  /** Total number of documents matching the query across all pages. */
  totalMatches: number
}

/**
 * The current state of a single JSON editor field (filter / sort / projection).
 */
export interface JsonEditorState {
  /** The raw text in the editor. */
  raw: string
  /** Whether the current raw text parses as valid JSON. */
  isValid: boolean
  /** Parse error message, or null if valid. */
  error: string | null
}

/**
 * The three query editor fields as a named group.
 */
export interface QueryEditorFields {
  filter: JsonEditorState
  sort: JsonEditorState
  projection: JsonEditorState
}

/**
 * Pagination state: an ordered list of offset tokens representing
 * each page boundary. Index 0 is always `null` (the first page).
 */
export interface PaginationState {
  /** The offset token for each known page. `offsets[0] === null`. */
  offsets: Array<string | null>
  /** Zero-based index of the currently visible page. */
  currentPage: number
  /** Whether a next page is known to exist. */
  hasNext: boolean
}

/**
 * A single entry in the MongoDB query cheat sheet.
 */
export interface CheatSheetEntry {
  /** The MongoDB operator name, e.g. `$eq`. */
  operator: string
  /** Short description of what the operator does. */
  description: string
  /** Ready-to-paste JSON snippet demonstrating usage. */
  snippet: string
}

/**
 * A grouping of cheat sheet entries under a category heading.
 */
export interface CheatSheetCategory {
  /** Category label, e.g. "Comparison". */
  label: string
  entries: CheatSheetEntry[]
}

/**
 * A value that can appear in a JSON tree node.
 * Supports the full range of JSON value types recursively.
 */
export type JsonNodeValue =
  | string
  | number
  | boolean
  | null
  | JsonNodeValue[]
  | { [key: string]: JsonNodeValue }

/** The type label shown inline in the JSON tree explorer. */
export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
