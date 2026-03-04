/**
 * Deterministic fake document generators for each collection.
 * Uses docIndex = page * limit + i for reproducible results.
 */

const ROLES = ['admin', 'user', 'moderator', 'viewer']
const STATUSES_USER = ['active', 'inactive', 'suspended', 'pending']
const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR', 'IN', 'MX']
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
const CATEGORIES = ['electronics', 'clothing', 'books', 'food', 'sports', 'toys', 'home']
const LOG_LEVELS = ['info', 'warn', 'error', 'debug']
const SERVICES = ['auth', 'api', 'worker', 'scheduler', 'notifier', 'storage']

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack']
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas']

const LOG_MESSAGES = [
  'User logged in successfully',
  'Failed login attempt',
  'Password reset requested',
  'Token expired',
  'Rate limit exceeded',
  'Database connection timeout',
  'Cache miss for key',
  'Scheduled job started',
  'Scheduled job completed',
  'Webhook delivery failed',
  'File upload completed',
  'Payment processed',
]

const PRODUCT_NAMES = [
  'Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub', 'Monitor Stand', 'Laptop Bag',
  'Blue T-Shirt', 'Running Shoes', 'Yoga Mat', 'Water Bottle', 'Backpack',
  'JavaScript Book', 'Design Patterns', 'TypeScript Handbook', 'Clean Code', 'Pragmatic Programmer',
]

function pick(arr, i) {
  return arr[i % arr.length]
}

function fakeDate(baseMs, offsetDays) {
  return new Date(baseMs - offsetDays * 86400000).toISOString()
}

const BASE_TIME = new Date('2024-01-01T00:00:00Z').getTime()

/** Generates a page of user documents. */
export function generateUsers(page, limit) {
  const docs = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    const first = pick(FIRST_NAMES, idx)
    const last = pick(LAST_NAMES, Math.floor(idx / FIRST_NAMES.length))
    docs.push({
      _id: `user_${idx.toString().padStart(6, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${idx}@example.com`,
      role: pick(ROLES, idx),
      status: pick(STATUSES_USER, idx),
      age: 20 + (idx % 50),
      country: pick(COUNTRIES, idx),
      createdAt: fakeDate(BASE_TIME, idx % 365),
      lastLogin: fakeDate(BASE_TIME, idx % 30),
    })
  }
  return docs
}

/** Generates a page of order documents. */
export function generateOrders(page, limit) {
  const docs = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    const itemCount = 1 + (idx % 5)
    const items = []
    for (let j = 0; j < itemCount; j++) {
      items.push({
        productId: `prod_${((idx + j) % 892).toString().padStart(4, '0')}`,
        qty: 1 + (j % 3),
        price: parseFloat((9.99 + (idx % 100) + j * 5).toFixed(2)),
      })
    }
    docs.push({
      _id: `order_${idx.toString().padStart(6, '0')}`,
      userId: `user_${(idx % 2847).toString().padStart(6, '0')}`,
      status: pick(ORDER_STATUSES, idx),
      total: parseFloat(items.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2)),
      currency: pick(CURRENCIES, idx),
      items,
      createdAt: fakeDate(BASE_TIME, idx % 365),
      shippedAt: pick(ORDER_STATUSES, idx) === 'shipped' ? fakeDate(BASE_TIME, (idx % 365) - 2) : null,
    })
  }
  return docs
}

/** Generates a page of product documents. */
export function generateProducts(page, limit) {
  const docs = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    docs.push({
      _id: `prod_${idx.toString().padStart(4, '0')}`,
      sku: `SKU-${(1000 + idx).toString()}`,
      name: `${pick(PRODUCT_NAMES, idx)} ${idx}`,
      category: pick(CATEGORIES, idx),
      price: parseFloat((4.99 + (idx % 200)).toFixed(2)),
      stock: idx % 50,
      tags: [pick(CATEGORIES, idx), pick(CATEGORIES, idx + 1)],
      rating: parseFloat((3.0 + (idx % 20) / 10).toFixed(1)),
      reviewCount: idx % 500,
    })
  }
  return docs
}

/** Generates a page of session documents. */
export function generateSessions(page, limit) {
  const docs = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    const createdAt = fakeDate(BASE_TIME, idx % 90)
    docs.push({
      _id: `sess_${idx.toString().padStart(8, '0')}`,
      userId: `user_${(idx % 2847).toString().padStart(6, '0')}`,
      ip: `192.168.${idx % 255}.${(idx * 7) % 255}`,
      userAgent: idx % 3 === 0 ? 'Mozilla/5.0 Chrome/120' : idx % 3 === 1 ? 'Mozilla/5.0 Firefox/120' : 'curl/7.88',
      createdAt,
      expiresAt: new Date(new Date(createdAt).getTime() + 86400000 * 7).toISOString(),
      isActive: idx % 4 !== 0,
      requestCount: idx % 300,
    })
  }
  return docs
}

/** Generates a page of log documents. */
export function generateLogs(page, limit) {
  const docs = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    docs.push({
      _id: `log_${idx.toString().padStart(10, '0')}`,
      level: pick(LOG_LEVELS, idx),
      message: pick(LOG_MESSAGES, idx),
      service: pick(SERVICES, idx),
      timestamp: fakeDate(BASE_TIME, idx % 30),
      metadata: {
        userId: idx % 5 === 0 ? `user_${(idx % 2847).toString().padStart(6, '0')}` : null,
        duration: idx % 1000,
      },
      requestId: `req_${idx.toString(16).padStart(8, '0')}`,
    })
  }
  return docs
}

export const COLLECTION_META = {
  users: { total: 2847, generator: generateUsers },
  orders: { total: 15234, generator: generateOrders },
  products: { total: 892, generator: generateProducts },
  sessions: { total: 48921, generator: generateSessions },
  logs: { total: 1247832, generator: generateLogs },
}
