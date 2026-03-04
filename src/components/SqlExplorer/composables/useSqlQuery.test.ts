import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSqlQuery } from './useSqlQuery'

function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

const VALID_RESPONSE = {
  data: { columns: ['id', 'name'], rows: [[1, 'Alice'], [2, 'Bob']] },
  offset: 'abc',
}

describe('useSqlQuery', () => {
  let query: ReturnType<typeof useSqlQuery>

  beforeEach(() => {
    vi.mocked(fetch).mockReset()
    query = useSqlQuery()
    query.setSource('users')
    query.setSql('SELECT * FROM users')
  })

  it('canQuery is false when source is empty', () => {
    query.setSource('')
    expect(query.canQuery.value).toBe(false)
  })

  it('canQuery is false when sql is empty', () => {
    query.setSql('')
    expect(query.canQuery.value).toBe(false)
  })

  it('canQuery is true when source and sql are set', () => {
    expect(query.canQuery.value).toBe(true)
  })

  it('runQuery sends correct POST body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/sql/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'users',
        sql: 'SELECT * FROM users',
        offset: null,
        limit: 100,
      }),
    })
  })

  it('populates columns and rows after runQuery', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()

    expect(query.columns.value).toEqual(['id', 'name'])
    expect(query.rows.value).toEqual([[1, 'Alice'], [2, 'Bob']])
  })

  it('isLoading is false after successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.isLoading.value).toBe(false)
  })

  it('hasMore is true when offset is non-null and rows < MAX_ROWS', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.hasMore.value).toBe(true)
  })

  it('hasMore is false when offset is null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse({ ...VALID_RESPONSE, offset: null }))
    await query.runQuery()
    expect(query.hasMore.value).toBe(false)
  })

  it('fetchError is set on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network down'))
    await query.runQuery()
    expect(query.fetchError.value).toBe('Network down')
    expect(query.rows.value).toEqual([])
  })

  it('fetchError is set on non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse('Not Found', false, 404))
    await query.runQuery()
    expect(query.fetchError.value).toContain('HTTP 404')
  })

  it('fetchError is set on invalid response shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse({ wrong: 'shape' }))
    await query.runQuery()
    expect(query.fetchError.value).toContain('Unexpected response format')
  })

  it('loadMore appends rows from the next page', async () => {
    const page2 = { data: { columns: ['id', 'name'], rows: [[3, 'Carol']] }, offset: null }
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
      .mockResolvedValueOnce(mockResponse(page2))

    await query.runQuery()
    await query.loadMore()

    expect(query.rows.value).toEqual([[1, 'Alice'], [2, 'Bob'], [3, 'Carol']])
    expect(query.hasMore.value).toBe(false)
  })

  it('loadMore sends the offset from the previous response', async () => {
    const page2 = { data: { columns: ['id', 'name'], rows: [[3, 'Carol']] }, offset: null }
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
      .mockResolvedValueOnce(mockResponse(page2))

    await query.runQuery()
    await query.loadMore()

    const calls = vi.mocked(fetch).mock.calls
    const secondBody = JSON.parse(calls[1]![1]!.body as string) as { offset: string }
    expect(secondBody.offset).toBe('abc')
  })

  it('loadMore is a no-op when hasMore is false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse({ ...VALID_RESPONSE, offset: null }))
    await query.runQuery()
    await query.loadMore()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('runQuery resets rows from previous query', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
      .mockResolvedValueOnce(mockResponse({ data: { columns: ['id'], rows: [[99]] }, offset: null }))

    await query.runQuery()
    await query.runQuery()

    expect(query.rows.value).toEqual([[99]])
  })

  it('setSource clears rows and resets state', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()

    query.setSource('orders')

    expect(query.rows.value).toEqual([])
    expect(query.columns.value).toEqual([])
    expect(query.fetchError.value).toBeNull()
    expect(query.hasMore.value).toBe(false)
  })

  it('rowCount reflects loaded row count', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.rowCount.value).toBe(2)
  })
})
