import http from 'node:http'
import { COLLECTION_META } from './data/collections.mjs'
import { sampleQueries } from './data/sampleQueries.mjs'
import { SQL_SOURCE_META } from './data/sqlSources.mjs'
import { sqlSampleQueries } from './data/sqlSampleQueries.mjs'
import { API_SOURCES, buildMockResponse } from './data/apiSources.mjs'

const PORT = 3001

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')) }
      catch { reject(new Error('Invalid JSON body')) }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/metadata') {
    json(res, 200, {
      collections: Object.keys(COLLECTION_META),
      sampleQueries,
    })
    return
  }

  if (req.method === 'POST' && req.url === '/query') {
    let body
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const { collection, offset, limit = 100 } = body
    const meta = COLLECTION_META[collection]

    if (!meta) {
      json(res, 400, { error: `Unknown collection: ${collection}` })
      return
    }

    const pageSize = Math.min(Math.max(1, limit), 200)
    const page = offset ? parseInt(atob(offset), 10) : 0
    const totalMatches = meta.total
    const totalPages = Math.ceil(totalMatches / pageSize)

    const docsToGen = Math.min(pageSize, totalMatches - page * pageSize)
    const data = docsToGen > 0 ? meta.generator(page, docsToGen) : []
    const nextPage = page + 1
    const finalOffset = nextPage < totalPages ? btoa(String(nextPage)) : null

    json(res, 200, { data, finalOffset, totalMatches })
    return
  }

  if (req.method === 'GET' && req.url === '/sql/metadata') {
    const sources = Object.keys(SQL_SOURCE_META).map(id => ({ id, name: id }))
    json(res, 200, { sources, sampleQueries: sqlSampleQueries, flavor: 'PostgreSQL' })
    return
  }

  if (req.method === 'POST' && req.url === '/sql/query') {
    let body
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const { source, offset, limit = 100 } = body
    const meta = SQL_SOURCE_META[source]

    if (!meta) {
      json(res, 400, { error: `Unknown source: ${source}` })
      return
    }

    const pageSize = Math.min(Math.max(1, limit), 200)
    const page = offset ? parseInt(atob(offset), 10) : 0
    const totalRows = meta.total
    const totalPages = Math.ceil(totalRows / pageSize)

    const rowsToGen = Math.min(pageSize, totalRows - page * pageSize)
    const rows = rowsToGen > 0 ? meta.generator(page, rowsToGen) : []
    const nextPage = page + 1
    const nextOffset = nextPage < totalPages ? btoa(String(nextPage)) : null

    json(res, 200, { data: { columns: meta.columns, rows }, offset: nextOffset })
    return
  }

  if (req.method === 'GET' && req.url === '/api-explorer/metadata') {
    json(res, 200, { sources: API_SOURCES })
    return
  }

  if (req.method === 'POST' && req.url === '/api-explorer/send') {
    let body
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const { endpointId, body: rawBody, contentType } = body

    // Find endpoint across all sources
    const endpoint = API_SOURCES.flatMap(s => s.endpoints).find(e => e.id === endpointId)
    if (!endpoint) {
      json(res, 400, { error: `Unknown endpoint: ${endpointId}` })
      return
    }

    let parsedBody = rawBody
    if (contentType === 'application/json' && typeof rawBody === 'string') {
      try { parsedBody = JSON.parse(rawBody) } catch { parsedBody = {} }
    }

    const mockResponse = buildMockResponse(endpointId, parsedBody)
    json(res, 200, mockResponse)
    return
  }

  json(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Stub server running at http://localhost:${PORT}`)
})
