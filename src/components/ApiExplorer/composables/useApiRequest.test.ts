import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApiRequest } from './useApiRequest'
import type { ApiSource, ApiResponse } from '../types'
import * as api from '../api'

const MOCK_SOURCES: ApiSource[] = [
  {
    id: 'users-api',
    name: 'Users API',
    description: 'User CRUD',
    baseUrl: 'https://api.example.com',
    endpoints: [
      {
        id: 'users-list',
        name: 'List users',
        method: 'GET',
        path: '/users',
        description: 'List all users',
        defaultContentType: 'none',
      },
      {
        id: 'users-create',
        name: 'Create user',
        method: 'POST',
        path: '/users',
        description: 'Create a user',
        defaultContentType: 'application/json',
        sampleBody: '{"name":"Alice"}',
      },
    ],
  },
  {
    id: 'orders-api',
    name: 'Orders API',
    description: 'Order management',
    baseUrl: 'https://api.example.com',
    endpoints: [
      {
        id: 'orders-list',
        name: 'List orders',
        method: 'GET',
        path: '/orders',
        description: 'List orders',
        defaultContentType: 'none',
      },
    ],
  },
]

const MOCK_RESPONSE: ApiResponse = {
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  body: '{"id":"usr_1"}',
  contentType: 'application/json',
  elapsed: 120,
}

describe('useApiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function make() {
    const sources = ref(MOCK_SOURCES)
    return { r: useApiRequest(sources), sources }
  }

  it('canSend is false when sourceId is empty', () => {
    const { r } = make()
    expect(r.canSend.value).toBe(false)
  })

  it('canSend is false when endpointId is empty', () => {
    const { r } = make()
    r.setSource('users-api')
    expect(r.canSend.value).toBe(false)
  })

  it('canSend is true when both sourceId and endpointId are set', () => {
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    expect(r.canSend.value).toBe(true)
  })

  it('setSource clears endpointId, body, contentType, response, and headers', () => {
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-create')
    r.addHeader()

    r.setSource('orders-api')

    expect(r.endpointId.value).toBe('')
    expect(r.body.value).toBe('')
    expect(r.contentType.value).toBe('none')
    expect(r.response.value).toBeNull()
    expect(r.headers.value).toHaveLength(0)
  })

  it('setEndpoint populates body from sampleBody', () => {
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-create')
    expect(r.body.value).toBe('{"name":"Alice"}')
  })

  it('setEndpoint sets contentType from defaultContentType', () => {
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-create')
    expect(r.contentType.value).toBe('application/json')
  })

  it('setEndpoint clears response', async () => {
    const sendSpy = vi.spyOn(api, 'sendApiRequest').mockResolvedValue(MOCK_RESPONSE)
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    await r.send()
    expect(r.response.value).not.toBeNull()

    r.setEndpoint('users-create')
    expect(r.response.value).toBeNull()
    sendSpy.mockRestore()
  })

  it('addHeader adds a new enabled empty entry', () => {
    const { r } = make()
    r.addHeader()
    expect(r.headers.value).toHaveLength(1)
    expect(r.headers.value[0]!.key).toBe('')
    expect(r.headers.value[0]!.value).toBe('')
    expect(r.headers.value[0]!.enabled).toBe(true)
  })

  it('removeHeader removes the entry at the given index', () => {
    const { r } = make()
    r.addHeader()
    r.addHeader()
    const idToRemove = r.headers.value[0]!.id
    r.removeHeader(0)
    expect(r.headers.value).toHaveLength(1)
    expect(r.headers.value[0]!.id).not.toBe(idToRemove)
  })

  it('updateHeader updates key and value', () => {
    const { r } = make()
    r.addHeader()
    r.updateHeader(0, 'Authorization', 'Bearer token')
    expect(r.headers.value[0]!.key).toBe('Authorization')
    expect(r.headers.value[0]!.value).toBe('Bearer token')
  })

  it('toggleHeader toggles the enabled flag', () => {
    const { r } = make()
    r.addHeader()
    expect(r.headers.value[0]!.enabled).toBe(true)
    r.toggleHeader(0)
    expect(r.headers.value[0]!.enabled).toBe(false)
    r.toggleHeader(0)
    expect(r.headers.value[0]!.enabled).toBe(true)
  })

  it('send calls sendApiRequest with the correct shape', async () => {
    const sendSpy = vi.spyOn(api, 'sendApiRequest').mockResolvedValue(MOCK_RESPONSE)
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-create')
    r.addHeader()
    r.updateHeader(0, 'X-Custom', 'value')

    await r.send()

    expect(sendSpy).toHaveBeenCalledWith({
      sourceId: 'users-api',
      endpointId: 'users-create',
      body: '{"name":"Alice"}',
      contentType: 'application/json',
      headers: { 'X-Custom': 'value' },
    })
  })

  it('send populates response on success', async () => {
    vi.spyOn(api, 'sendApiRequest').mockResolvedValue(MOCK_RESPONSE)
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    await r.send()
    expect(r.response.value).toEqual(MOCK_RESPONSE)
    expect(r.isLoading.value).toBe(false)
  })

  it('send sets sendError on network failure', async () => {
    vi.spyOn(api, 'sendApiRequest').mockRejectedValue(new Error('Network error'))
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    await r.send()
    expect(r.sendError.value).toBe('Network error')
    expect(r.response.value).toBeNull()
  })

  it('send excludes disabled headers from request', async () => {
    const sendSpy = vi.spyOn(api, 'sendApiRequest').mockResolvedValue(MOCK_RESPONSE)
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    r.addHeader()
    r.updateHeader(0, 'X-Active', 'yes')
    r.addHeader()
    r.updateHeader(1, 'X-Disabled', 'no')
    r.toggleHeader(1)

    await r.send()

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { 'X-Active': 'yes' } })
    )
  })

  it('send resets isLoading to false on error', async () => {
    vi.spyOn(api, 'sendApiRequest').mockRejectedValue(new Error('oops'))
    const { r } = make()
    r.setSource('users-api')
    r.setEndpoint('users-list')
    await r.send()
    expect(r.isLoading.value).toBe(false)
  })
})
