/**
 * Deterministic mock API source definitions and response generator.
 * Each source has endpoints with sample bodies and presets.
 */

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function makeRequestId(endpointId) {
  return `req_${simpleHash(endpointId).toString(16).padStart(8, '0')}`
}

export const API_SOURCES = [
  {
    id: 'users-api',
    name: 'Users API',
    description: 'CRUD operations for user accounts',
    baseUrl: 'https://api.example.com/v1',
    endpoints: [
      {
        id: 'users-list',
        name: 'List users',
        method: 'GET',
        path: '/users',
        description: 'Returns a paginated list of all users',
        defaultContentType: 'none',
      },
      {
        id: 'users-get',
        name: 'Get user by ID',
        method: 'GET',
        path: '/users/:id',
        description: 'Returns a single user by their ID',
        defaultContentType: 'none',
      },
      {
        id: 'users-create',
        name: 'Create user',
        method: 'POST',
        path: '/users',
        description: 'Creates a new user account',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "name": "Alice Smith",\n  "email": "alice@example.com",\n  "role": "user"\n}',
        presets: [
          {
            id: 'users-create-valid',
            name: 'Valid user',
            body: '{\n  "name": "Alice Smith",\n  "email": "alice@example.com",\n  "role": "user"\n}',
          },
          {
            id: 'users-create-admin',
            name: 'Admin user',
            body: '{\n  "name": "Bob Admin",\n  "email": "bob@example.com",\n  "role": "admin"\n}',
          },
          {
            id: 'users-create-missing-email',
            name: 'Missing email (400)',
            body: '{\n  "name": "No Email"\n}',
          },
        ],
      },
      {
        id: 'users-update',
        name: 'Update user',
        method: 'PUT',
        path: '/users/:id',
        description: 'Replaces a user record by ID',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "name": "Alice Updated",\n  "email": "alice.updated@example.com",\n  "role": "user"\n}',
        presets: [
          {
            id: 'users-update-valid',
            name: 'Update name',
            body: '{\n  "name": "Alice Updated",\n  "email": "alice.updated@example.com",\n  "role": "user"\n}',
          },
        ],
      },
      {
        id: 'users-delete',
        name: 'Delete user',
        method: 'DELETE',
        path: '/users/:id',
        description: 'Deletes a user by ID',
        defaultContentType: 'none',
      },
    ],
  },
  {
    id: 'orders-api',
    name: 'Orders API',
    description: 'Order management and status tracking',
    baseUrl: 'https://api.example.com/v1',
    endpoints: [
      {
        id: 'orders-list',
        name: 'List orders',
        method: 'GET',
        path: '/orders',
        description: 'Returns a paginated list of orders',
        defaultContentType: 'none',
      },
      {
        id: 'orders-get',
        name: 'Get order by ID',
        method: 'GET',
        path: '/orders/:id',
        description: 'Returns a single order by ID',
        defaultContentType: 'none',
      },
      {
        id: 'orders-create',
        name: 'Create order',
        method: 'POST',
        path: '/orders',
        description: 'Creates a new order',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "userId": "usr_123",\n  "items": [\n    { "productId": "prod_1", "qty": 2 }\n  ]\n}',
        presets: [
          {
            id: 'orders-create-valid',
            name: 'Valid order',
            body: '{\n  "userId": "usr_123",\n  "items": [\n    { "productId": "prod_1", "qty": 2 }\n  ]\n}',
          },
          {
            id: 'orders-create-empty-items',
            name: 'Empty items (400)',
            body: '{\n  "userId": "usr_123",\n  "items": []\n}',
          },
        ],
      },
      {
        id: 'orders-patch-status',
        name: 'Update order status',
        method: 'PATCH',
        path: '/orders/:id/status',
        description: 'Updates the status of an existing order',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "status": "shipped"\n}',
        presets: [
          {
            id: 'orders-status-shipped',
            name: 'Mark shipped',
            body: '{\n  "status": "shipped"\n}',
          },
          {
            id: 'orders-status-invalid',
            name: 'Invalid status (400)',
            body: '{\n  "status": "teleported"\n}',
          },
        ],
      },
    ],
  },
  {
    id: 'products-api',
    name: 'Products API',
    description: 'Product catalog management',
    baseUrl: 'https://api.example.com/v1',
    endpoints: [
      {
        id: 'products-list',
        name: 'List products',
        method: 'GET',
        path: '/products',
        description: 'Returns all products in the catalog',
        defaultContentType: 'none',
      },
      {
        id: 'products-get',
        name: 'Get product by ID',
        method: 'GET',
        path: '/products/:id',
        description: 'Returns a single product by ID',
        defaultContentType: 'none',
      },
      {
        id: 'products-create',
        name: 'Create product',
        method: 'POST',
        path: '/products',
        description: 'Adds a new product to the catalog',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "name": "Wireless Mouse",\n  "price": 29.99,\n  "category": "electronics",\n  "stock": 100\n}',
        presets: [
          {
            id: 'products-create-valid',
            name: 'Valid product',
            body: '{\n  "name": "Wireless Mouse",\n  "price": 29.99,\n  "category": "electronics",\n  "stock": 100\n}',
          },
          {
            id: 'products-create-negative-price',
            name: 'Negative price (400)',
            body: '{\n  "name": "Broken Item",\n  "price": -5,\n  "category": "electronics",\n  "stock": 0\n}',
          },
        ],
      },
    ],
  },
  {
    id: 'auth-api',
    name: 'Auth API',
    description: 'Authentication and session management',
    baseUrl: 'https://api.example.com/v1',
    endpoints: [
      {
        id: 'auth-login',
        name: 'Login',
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticates a user and returns tokens',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "email": "alice@example.com",\n  "password": "secret123"\n}',
        presets: [
          {
            id: 'auth-login-valid',
            name: 'Valid credentials',
            body: '{\n  "email": "alice@example.com",\n  "password": "secret123"\n}',
          },
          {
            id: 'auth-login-bad',
            name: 'Bad credentials (401)',
            body: '{\n  "email": "nobody@example.com",\n  "password": "wrong"\n}',
          },
        ],
      },
      {
        id: 'auth-refresh',
        name: 'Refresh token',
        method: 'POST',
        path: '/auth/refresh',
        description: 'Issues a new access token using a refresh token',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "refreshToken": "rt_abc123"\n}',
        presets: [
          {
            id: 'auth-refresh-valid',
            name: 'Valid token',
            body: '{\n  "refreshToken": "rt_abc123"\n}',
          },
          {
            id: 'auth-refresh-expired',
            name: 'Expired token (401)',
            body: '{\n  "refreshToken": "rt_expired"\n}',
          },
        ],
      },
      {
        id: 'auth-logout',
        name: 'Logout',
        method: 'POST',
        path: '/auth/logout',
        description: 'Invalidates the current session',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "refreshToken": "rt_abc123"\n}',
        presets: [
          {
            id: 'auth-logout-valid',
            name: 'Logout session',
            body: '{\n  "refreshToken": "rt_abc123"\n}',
          },
        ],
      },
      {
        id: 'auth-me',
        name: 'Get current user',
        method: 'GET',
        path: '/auth/me',
        description: 'Returns the currently authenticated user',
        defaultContentType: 'none',
      },
    ],
  },
  {
    id: 'events-api',
    name: 'Events API',
    description: 'Event streaming and publishing',
    baseUrl: 'https://api.example.com/v1',
    endpoints: [
      {
        id: 'events-list',
        name: 'List events',
        method: 'GET',
        path: '/events',
        description: 'Returns recent events from the stream',
        defaultContentType: 'none',
      },
      {
        id: 'events-publish',
        name: 'Publish event',
        method: 'POST',
        path: '/events',
        description: 'Publishes a new event to the stream',
        defaultContentType: 'application/json',
        sampleBody: '{\n  "type": "user.signup",\n  "payload": {\n    "userId": "usr_123",\n    "email": "alice@example.com"\n  }\n}',
        presets: [
          {
            id: 'events-publish-valid',
            name: 'Valid event',
            body: '{\n  "type": "user.signup",\n  "payload": {\n    "userId": "usr_123",\n    "email": "alice@example.com"\n  }\n}',
          },
          {
            id: 'events-publish-empty-type',
            name: 'Empty type (400)',
            body: '{\n  "type": "",\n  "payload": {}\n}',
          },
        ],
      },
    ],
  },
]

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

/**
 * Builds a deterministic mock response for a given endpoint and parsed body.
 * 4xx rules mirror business logic described in the plan.
 */
export function buildMockResponse(endpointId, bodyObj) {
  const elapsed = 50 + (simpleHash(endpointId) % 251)
  const requestId = makeRequestId(endpointId)

  function ok(status, statusText, body) {
    const bodyStr = body === '' ? '' : JSON.stringify(body, null, 2)
    return {
      status,
      statusText,
      elapsed,
      headers: {
        'content-type': body === '' ? '' : 'application/json',
        'x-request-id': requestId,
      },
      body: bodyStr,
    }
  }

  function err(status, statusText, message) {
    const body = JSON.stringify({ error: message }, null, 2)
    return {
      status,
      statusText,
      elapsed,
      headers: {
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
      body,
    }
  }

  switch (endpointId) {
    case 'users-list':
      return ok(200, 'OK', {
        data: [
          { id: 'usr_1', name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
          { id: 'usr_2', name: 'Bob Jones', email: 'bob@example.com', role: 'user' },
          { id: 'usr_3', name: 'Carol Brown', email: 'carol@example.com', role: 'moderator' },
        ],
        total: 3,
        page: 1,
      })

    case 'users-get':
      return ok(200, 'OK', {
        id: 'usr_1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: 'admin',
        createdAt: '2024-01-15T10:30:00Z',
      })

    case 'users-create': {
      const b = bodyObj || {}
      if (!b.email) return err(400, 'Bad Request', 'email is required')
      return ok(201, 'Created', {
        id: 'usr_' + simpleHash(b.email || 'x').toString(36),
        name: b.name || '',
        email: b.email,
        role: b.role || 'user',
        createdAt: '2024-03-04T12:00:00Z',
      })
    }

    case 'users-update':
      return ok(200, 'OK', {
        id: 'usr_1',
        name: (bodyObj || {}).name || 'Alice Smith',
        email: (bodyObj || {}).email || 'alice@example.com',
        role: (bodyObj || {}).role || 'user',
        updatedAt: '2024-03-04T12:00:00Z',
      })

    case 'users-delete':
      return ok(204, 'No Content', '')

    case 'orders-list':
      return ok(200, 'OK', {
        data: [
          { id: 'ord_1', userId: 'usr_1', total: 59.98, status: 'shipped', createdAt: '2024-02-10T09:00:00Z' },
          { id: 'ord_2', userId: 'usr_2', total: 12.50, status: 'pending', createdAt: '2024-02-20T14:30:00Z' },
        ],
        total: 2,
      })

    case 'orders-get':
      return ok(200, 'OK', {
        id: 'ord_1',
        userId: 'usr_1',
        items: [
          { productId: 'prod_1', qty: 2, price: 29.99 },
        ],
        total: 59.98,
        status: 'shipped',
        createdAt: '2024-02-10T09:00:00Z',
      })

    case 'orders-create': {
      const b = bodyObj || {}
      if (!Array.isArray(b.items) || b.items.length === 0)
        return err(400, 'Bad Request', 'items must be a non-empty array')
      return ok(201, 'Created', {
        id: 'ord_' + Date.now().toString(36),
        userId: b.userId || 'usr_unknown',
        items: b.items,
        total: b.items.reduce((s, it) => s + (it.qty || 1) * 9.99, 0),
        status: 'pending',
        createdAt: '2024-03-04T12:00:00Z',
      })
    }

    case 'orders-patch-status': {
      const b = bodyObj || {}
      if (!VALID_ORDER_STATUSES.includes(b.status))
        return err(400, 'Bad Request', `status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`)
      return ok(200, 'OK', { id: 'ord_1', status: b.status, updatedAt: '2024-03-04T12:00:00Z' })
    }

    case 'products-list':
      return ok(200, 'OK', {
        data: [
          { id: 'prod_1', name: 'Wireless Mouse', category: 'electronics', price: 29.99, stock: 100 },
          { id: 'prod_2', name: 'Mechanical Keyboard', category: 'electronics', price: 89.99, stock: 45 },
          { id: 'prod_3', name: 'USB-C Hub', category: 'electronics', price: 49.99, stock: 200 },
        ],
        total: 3,
      })

    case 'products-get':
      return ok(200, 'OK', {
        id: 'prod_1',
        name: 'Wireless Mouse',
        category: 'electronics',
        price: 29.99,
        stock: 100,
        createdAt: '2024-01-01T00:00:00Z',
      })

    case 'products-create': {
      const b = bodyObj || {}
      if (typeof b.price === 'number' && b.price < 0)
        return err(400, 'Bad Request', 'price must be non-negative')
      return ok(201, 'Created', {
        id: 'prod_' + simpleHash(b.name || 'x').toString(36),
        name: b.name || '',
        category: b.category || 'uncategorized',
        price: b.price ?? 0,
        stock: b.stock ?? 0,
        createdAt: '2024-03-04T12:00:00Z',
      })
    }

    case 'auth-login': {
      const b = bodyObj || {}
      if (typeof b.email === 'string' && b.email.includes('nobody'))
        return err(401, 'Unauthorized', 'invalid credentials')
      return ok(200, 'OK', {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3JfMSJ9.faketoken',
        refreshToken: 'rt_abc123',
        expiresIn: 3600,
      })
    }

    case 'auth-refresh': {
      const b = bodyObj || {}
      if (b.refreshToken === 'rt_expired')
        return err(401, 'Unauthorized', 'refresh token expired')
      return ok(200, 'OK', {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3JfMSJ9.refreshed',
        expiresIn: 3600,
      })
    }

    case 'auth-logout':
      return ok(204, 'No Content', '')

    case 'auth-me':
      return ok(200, 'OK', {
        id: 'usr_1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: 'admin',
        lastLoginAt: '2024-03-04T08:00:00Z',
      })

    case 'events-list':
      return ok(200, 'OK', {
        data: [
          { id: 'evt_1', type: 'user.signup', payload: { userId: 'usr_3' }, occurredAt: '2024-03-04T11:00:00Z' },
          { id: 'evt_2', type: 'order.created', payload: { orderId: 'ord_2' }, occurredAt: '2024-03-04T11:05:00Z' },
        ],
        total: 2,
      })

    case 'events-publish': {
      const b = bodyObj || {}
      if (typeof b.type !== 'string' || b.type.trim() === '')
        return err(400, 'Bad Request', 'type must be a non-empty string')
      return ok(202, 'Accepted', {
        id: 'evt_' + simpleHash(b.type).toString(36),
        type: b.type,
        payload: b.payload || {},
        occurredAt: '2024-03-04T12:00:00Z',
      })
    }

    default:
      return err(404, 'Not Found', `unknown endpoint: ${endpointId}`)
  }
}
