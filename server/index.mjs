import http from 'node:http'
import { COLLECTION_META } from './data/collections.mjs'
import { sampleQueries } from './data/sampleQueries.mjs'

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

  json(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Stub server running at http://localhost:${PORT}`)
})
