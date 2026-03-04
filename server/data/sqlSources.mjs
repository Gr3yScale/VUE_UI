/**
 * Deterministic fake row generators for SQL source tables.
 * Uses rowIndex = page * limit + i for reproducible results.
 */

const ROLES = ['admin', 'user', 'moderator', 'viewer']
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const CATEGORIES = ['electronics', 'clothing', 'books', 'food', 'sports', 'toys', 'home']
const TRANSACTION_TYPES = ['purchase', 'refund', 'chargeback', 'adjustment']
const EVENT_TYPES = ['page_view', 'click', 'login', 'logout', 'purchase', 'search', 'signup', 'error']

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack']
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas']
const PRODUCT_NAMES = [
  'Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub', 'Monitor Stand', 'Laptop Bag',
  'Blue T-Shirt', 'Running Shoes', 'Yoga Mat', 'Water Bottle', 'Backpack',
]

function pick(arr, i) {
  return arr[i % arr.length]
}

function fakeDate(offsetDays) {
  const BASE_TIME = new Date('2024-01-01T00:00:00Z').getTime()
  return new Date(BASE_TIME - offsetDays * 86400000).toISOString().replace('T', ' ').replace('Z', '')
}

/** Generates a page of users rows. */
function generateUsers(page, limit) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    const first = pick(FIRST_NAMES, idx)
    const last = pick(LAST_NAMES, Math.floor(idx / FIRST_NAMES.length))
    rows.push([
      idx + 1,
      `${first.toLowerCase()}_${last.toLowerCase()}${idx}`,
      `${first.toLowerCase()}.${last.toLowerCase()}${idx}@example.com`,
      pick(ROLES, idx),
      fakeDate(idx % 365),
    ])
  }
  return rows
}

/** Generates a page of orders rows. */
function generateOrders(page, limit) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    rows.push([
      idx + 1,
      (idx % 3500) + 1,
      parseFloat((9.99 + (idx % 200) * 1.5).toFixed(2)),
      pick(ORDER_STATUSES, idx),
      fakeDate(idx % 365),
    ])
  }
  return rows
}

/** Generates a page of products rows. */
function generateProducts(page, limit) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    rows.push([
      idx + 1,
      `${pick(PRODUCT_NAMES, idx)} ${idx}`,
      pick(CATEGORIES, idx),
      parseFloat((4.99 + (idx % 200)).toFixed(2)),
      idx % 50,
    ])
  }
  return rows
}

/** Generates a page of transactions rows. */
function generateTransactions(page, limit) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    rows.push([
      idx + 1,
      (idx % 18000) + 1,
      parseFloat((1.00 + (idx % 500) * 0.99).toFixed(2)),
      pick(TRANSACTION_TYPES, idx),
      fakeDate(idx % 365),
    ])
  }
  return rows
}

/** Generates a page of events rows. Payload is a JSON string (exercises blob UI). */
function generateEvents(page, limit) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const idx = page * limit + i
    const eventType = pick(EVENT_TYPES, idx)
    const payload = JSON.stringify({
      sessionId: `sess_${idx.toString(16).padStart(12, '0')}`,
      eventType,
      userId: (idx % 3500) + 1,
      properties: {
        page: `/path/to/resource/${idx % 100}`,
        referrer: idx % 3 === 0 ? `https://google.com/search?q=product+${idx % 50}` : null,
        duration: idx % 30000,
        metadata: { version: '1.0', platform: idx % 2 === 0 ? 'web' : 'mobile' },
      },
      timestamp: fakeDate(idx % 90),
    })
    rows.push([
      idx + 1,
      (idx % 3500) + 1,
      eventType,
      payload,
      fakeDate(idx % 90),
    ])
  }
  return rows
}

export const SQL_SOURCE_META = {
  users: {
    total: 3500,
    columns: ['id', 'username', 'email', 'role', 'created_at'],
    generator: generateUsers,
  },
  orders: {
    total: 18000,
    columns: ['id', 'user_id', 'total', 'status', 'created_at'],
    generator: generateOrders,
  },
  products: {
    total: 1200,
    columns: ['id', 'name', 'category', 'price', 'stock'],
    generator: generateProducts,
  },
  transactions: {
    total: 52000,
    columns: ['id', 'order_id', 'amount', 'type', 'processed_at'],
    generator: generateTransactions,
  },
  events: {
    total: 210000,
    columns: ['id', 'user_id', 'event_type', 'payload', 'occurred_at'],
    generator: generateEvents,
  },
}
