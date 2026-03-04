/** The SQL dialect reported by the server. */
export type SqlFlavor = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'Standard SQL'

/** A SQL data source (table/view group) exposed by the server. */
export interface SqlSource {
  id: string
  name: string
}

/** A pre-built sample SQL query shown in the SampleQueryPicker. */
export interface SqlSampleQuery {
  id: string
  name: string
  /** Markdown content rendered in the SampleQueryPicker detail pane. */
  description: string
  /** The source ID this query targets. */
  source: string
  /** The SQL text to populate in the editor. */
  sql: string
}

/** Response from the `GET /sql/metadata` endpoint. */
export interface SqlMetadataResponse {
  sources: SqlSource[]
  sampleQueries: SqlSampleQuery[]
  flavor: SqlFlavor
}

/** Body sent to the `POST /sql/query` endpoint. */
export interface SqlQueryRequest {
  source: string
  sql: string
  /** Cursor offset for the current page. `null` means first page. */
  offset: string | null
  limit: number
}

/** Response from the `POST /sql/query` endpoint. */
export interface SqlQueryResponse {
  data: {
    columns: string[]
    rows: unknown[][]
  }
  /** Cursor for the next page, or `null` if this is the last page. */
  offset: string | null
}

/** A single entry in the SQL cheat sheet. */
export interface CheatSheetEntry {
  keyword: string
  description: string
  snippet: string
}

/** A grouping of SQL cheat sheet entries under a category heading. */
export interface CheatSheetCategory {
  label: string
  entries: CheatSheetEntry[]
}
