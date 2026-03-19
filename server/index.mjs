import http from 'node:http'
import { COLLECTION_META } from './data/collections.mjs'
import { sampleQueries } from './data/sampleQueries.mjs'
import { SQL_SOURCE_META } from './data/sqlSources.mjs'
import { sqlSampleQueries } from './data/sqlSampleQueries.mjs'
import { API_SOURCES, buildMockResponse } from './data/apiSources.mjs'
import { tasks, createTask, getMockStatus, getChannels } from './data/taskData.mjs'

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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

  // MQ config
  if (req.method === 'GET' && req.url === '/mq/config') {
    json(res, 200, {
      mqNames: ['ORDERS.IN', 'PAYMENTS.IN', 'NOTIFICATIONS.OUT', 'AUDIT.LOG', 'DEAD.LETTER', 'RESTRICTED.QUEUE'],
      count: 6,
    })
    return
  }

  // MQ custom send
  if (req.method === 'POST' && req.url.startsWith('/mq/send_custom')) {
    let body
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const urlObj = new URL(req.url, 'http://localhost')
    const delimiter = urlObj.searchParams.get('delimiter')

    json(res, 200, {
      status: 'ok',
      messageId: `MSG-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      destination: `${body.host}:${body.port}/${body.queueName}`,
      queueManager: body.queueManager,
      channel: body.channel,
      bytesSent: Buffer.byteLength(body.message ?? '', 'utf8'),
      delimiter: delimiter ?? null,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // MQ named send — RESTRICTED.QUEUE returns 403
  const namedSendMatch = req.method === 'POST' && req.url.match(/^\/mq\/send\/([^?]+)/)
  if (namedSendMatch) {
    const mqName = decodeURIComponent(namedSendMatch[1])

    if (mqName === 'RESTRICTED.QUEUE') {
      json(res, 403, { error: 'Access denied: you do not have permission to write to RESTRICTED.QUEUE' })
      return
    }

    let body
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const urlObj = new URL(req.url, 'http://localhost')
    const delimiter = urlObj.searchParams.get('delimiter')

    json(res, 200, {
      status: 'ok',
      messageId: `MSG-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      queue: mqName,
      bytesSent: Buffer.byteLength(body.message ?? '', 'utf8'),
      delimiter: delimiter ?? null,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // --- Task routes ---
  // NOTE: static paths (/task/active, /task/stored, /task/inject/channels) must be matched
  // before the dynamic /task/:taskId wildcard.

  if (req.method === 'GET' && req.url === '/task/active') {
    const now = Date.now()
    const activeTaskIds = [...tasks.entries()]
      .filter(([, t]) => !t.stopped && (now - t.createdAt) < 15000)
      .map(([id]) => id)
    json(res, 200, { activeTaskIds, count: activeTaskIds.length, timestamp: new Date().toISOString() })
    return
  }

  if (req.method === 'GET' && req.url === '/task/stored') {
    const now = Date.now()
    const storedResultIds = [...tasks.entries()]
      .filter(([, t]) => t.stopped || (now - t.createdAt) >= 15000)
      .map(([id]) => id)
    json(res, 200, { storedResultIds, count: storedResultIds.length, timestamp: new Date().toISOString() })
    return
  }

  if (req.method === 'GET' && req.url.startsWith('/task/inject/channels')) {
    const urlObj = new URL(req.url, 'http://localhost')
    const source = urlObj.searchParams.get('source') ?? ''
    const env = urlObj.searchParams.get('env') ?? ''
    const channels = getChannels(source, env)
    json(res, 200, { source, environment: env, channels, count: channels.length })
    return
  }

  const injectMatch = req.method === 'POST' && req.url.match(/^\/task\/inject\/([^?]+)/)
  if (injectMatch) {
    const source = decodeURIComponent(injectMatch[1])
    let body
    try { body = await readBody(req) } catch { json(res, 400, { error: 'Invalid JSON body' }); return }
    const urlObj = new URL(req.url, 'http://localhost')
    const retentionMs = parseInt(urlObj.searchParams.get('resultRetentionMs') ?? '600000', 10)
    const taskId = createTask('INJECTION', { source, env: body.env, channel: body.channel })
    json(res, 200, {
      taskId,
      taskType: 'INJECTION',
      source,
      environment: body.env,
      channel: body.channel,
      resultRetentionMs: retentionMs,
      submittedAt: new Date().toISOString(),
    })
    return
  }

  if (req.method === 'POST' && req.url.startsWith('/task/track')) {
    let body
    try { body = await readBody(req) } catch { json(res, 400, { error: 'Invalid JSON body' }); return }
    const urlObj = new URL(req.url, 'http://localhost')
    const retentionMs = parseInt(urlObj.searchParams.get('resultRetentionMs') ?? '600000', 10)
    const taskId = createTask('TRACKING', {
      services: body.services,
      messageRef: body.messageRef,
      totalTimeoutMs: body.totalTimeoutMs,
    })
    json(res, 200, {
      taskId,
      taskType: 'TRACKING',
      services: body.services,
      messageRef: body.messageRef,
      totalTimeoutMs: body.totalTimeoutMs,
      resultRetentionMs: retentionMs,
      submittedAt: new Date().toISOString(),
    })
    return
  }

  const taskIdMatch = req.url.match(/^\/task\/([^?]+)/)
  if (taskIdMatch) {
    const taskId = decodeURIComponent(taskIdMatch[1])
    const task = tasks.get(taskId)

    if (req.method === 'GET') {
      if (!task) { json(res, 404, { error: `Task not found: ${taskId}` }); return }
      json(res, 200, getMockStatus(taskId, task))
      return
    }

    if (req.method === 'DELETE') {
      if (!task) { json(res, 404, { error: `Task not found: ${taskId}` }); return }
      const urlObj = new URL(req.url, 'http://localhost')
      const reason = urlObj.searchParams.get('reason') ?? 'User requested cancellation'
      const finalStatus = getMockStatus(taskId, task)
      task.stopped = true
      task.stoppedAt = new Date().toISOString()
      json(res, 200, {
        taskId,
        stopped: true,
        reason,
        stoppedAt: task.stoppedAt,
        finalStatus,
      })
      return
    }
  }

  json(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Stub server running at http://localhost:${PORT}`)
})
