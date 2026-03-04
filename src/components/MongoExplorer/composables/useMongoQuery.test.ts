import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMongoQuery } from './useMongoQuery'

function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

const VALID_RESPONSE = {
  data: [{ id: 'x', name: 'Test' }],
  finalOffset: 'abc',
  totalMatches: 500,
}

describe('useMongoQuery', () => {
  let query: ReturnType<typeof useMongoQuery>

  beforeEach(() => {
    vi.mocked(fetch).mockReset()
    query = useMongoQuery()
    query.setCollection('users')
  })

  it('canQuery is false when collection is empty', () => {
    query.setCollection('')
    expect(query.canQuery.value).toBe(false)
  })

  it('canQuery is true when collection is set and all editors are valid JSON', () => {
    expect(query.canQuery.value).toBe(true)
  })

  it('canQuery is false when any editor has invalid JSON', () => {
    query.updateEditor('filter', '{ invalid }')
    expect(query.canQuery.value).toBe(false)
  })

  it('updateEditor sets isValid false on malformed JSON', () => {
    query.updateEditor('sort', 'not json')
    expect(query.editors.sort.value.isValid).toBe(false)
    expect(query.editors.sort.value.error).toBeTruthy()
  })

  it('updateEditor sets isValid true on valid JSON', () => {
    query.updateEditor('filter', '{ "age": { "$gt": 25 } }')
    expect(query.editors.filter.value.isValid).toBe(true)
    expect(query.editors.filter.value.error).toBeNull()
  })

  it('runQuery sends correct POST body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    query.updateEditor('filter', '{"status":"active"}')

    await query.runQuery()

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'users',
        filter: { status: 'active' },
        sort: {},
        projection: {},
        offset: null,
        limit: 100,
      }),
    })
  })

  it('results are populated after runQuery', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))

    await query.runQuery()

    expect(query.results.value).toEqual(VALID_RESPONSE.data)
    expect(query.totalMatches.value).toBe(500)
  })

  it('isLoading is false after successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.isLoading.value).toBe(false)
  })

  it('hasNext is set true when finalOffset is non-null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.pagination.value.hasNext).toBe(true)
  })

  it('hasNext is set false when finalOffset is null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ ...VALID_RESPONSE, finalOffset: null }),
    )
    await query.runQuery()
    expect(query.pagination.value.hasNext).toBe(false)
  })

  it('fetchError is set on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network down'))
    await query.runQuery()
    expect(query.fetchError.value).toBe('Network down')
    expect(query.results.value).toEqual([])
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

  it('nextPage uses finalOffset from previous response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
      .mockResolvedValueOnce(mockResponse({ ...VALID_RESPONSE, finalOffset: 'cde' }))

    await query.runQuery()
    await query.nextPage()

    const calls = vi.mocked(fetch).mock.calls
    const secondBody = JSON.parse(calls[1]![1]!.body as string) as { offset: string }
    expect(secondBody.offset).toBe('abc')
    expect(query.pagination.value.currentPage).toBe(1)
  })

  it('prevPage re-fetches with the previous page offset', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
      .mockResolvedValueOnce(mockResponse({ ...VALID_RESPONSE, finalOffset: 'cde' }))
      .mockResolvedValueOnce(mockResponse(VALID_RESPONSE))

    await query.runQuery()
    await query.nextPage()
    await query.prevPage()

    const calls = vi.mocked(fetch).mock.calls
    const thirdBody = JSON.parse(calls[2]![1]!.body as string) as { offset: string | null }
    expect(thirdBody.offset).toBeNull()
    expect(query.pagination.value.currentPage).toBe(0)
  })

  it('nextPage is a no-op when hasNext is false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ ...VALID_RESPONSE, finalOffset: null }),
    )
    await query.runQuery()
    await query.nextPage()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('resetEditors clears results and resets editors to empty objects', () => {
    query.updateEditor('filter', '{"x":1}')
    query.resetEditors()

    expect(query.editors.filter.value.raw).toBe('{}')
    expect(query.results.value).toEqual([])
    expect(query.pagination.value.currentPage).toBe(0)
  })

  it('pageSummary is a non-empty string after a fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(VALID_RESPONSE))
    await query.runQuery()
    expect(query.pageSummary.value).toContain('Page 1')
    expect(query.pageSummary.value).toContain('500')
  })
})
