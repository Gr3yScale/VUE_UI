/**
 * Pre-built sample SQL queries for the SqlExplorer UI.
 * Each entry has id, name, description (Markdown), source, and sql.
 */
export const sqlSampleQueries = [
  {
    id: 'all-users',
    name: 'All Users',
    source: 'users',
    description: `## All Users

Returns all users sorted by creation date, newest first.

\`\`\`sql
SELECT * FROM users ORDER BY created_at DESC;
\`\`\`

**Use case:** User management — browse the full user list.`,
    sql: 'SELECT * FROM users\nORDER BY created_at DESC;',
  },
  {
    id: 'admin-users',
    name: 'Admin Users',
    source: 'users',
    description: `## Admin Users

Filters users by \`role = 'admin'\`.

\`\`\`sql
SELECT id, username, email, created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;
\`\`\`

**Use case:** Security audit — verify privileged accounts.`,
    sql: "SELECT id, username, email, created_at\nFROM users\nWHERE role = 'admin'\nORDER BY created_at DESC;",
  },
  {
    id: 'pending-orders',
    name: 'Pending Orders',
    source: 'orders',
    description: `## Pending Orders

Retrieves all orders with \`status = 'pending'\`, oldest first.

\`\`\`sql
SELECT * FROM orders
WHERE status = 'pending'
ORDER BY created_at ASC;
\`\`\`

**Use case:** Operations — fulfilment queue review.`,
    sql: "SELECT * FROM orders\nWHERE status = 'pending'\nORDER BY created_at ASC;",
  },
  {
    id: 'high-value-orders',
    name: 'High-Value Orders',
    source: 'orders',
    description: `## High-Value Orders

Orders with a total exceeding $500, sorted by total descending.

\`\`\`sql
SELECT id, user_id, total, status, created_at
FROM orders
WHERE total > 500
ORDER BY total DESC;
\`\`\`

**Use case:** Finance — large transaction reporting.`,
    sql: 'SELECT id, user_id, total, status, created_at\nFROM orders\nWHERE total > 500\nORDER BY total DESC;',
  },
  {
    id: 'low-stock',
    name: 'Low Stock Products',
    source: 'products',
    description: `## Low Stock Products

Products where stock is below 10, sorted by stock ascending (most critical first).

\`\`\`sql
SELECT id, name, category, price, stock
FROM products
WHERE stock < 10
ORDER BY stock ASC;
\`\`\`

**Use case:** Inventory — reorder alert list.`,
    sql: 'SELECT id, name, category, price, stock\nFROM products\nWHERE stock < 10\nORDER BY stock ASC;',
  },
  {
    id: 'products-by-category',
    name: 'Products by Category',
    source: 'products',
    description: `## Products by Category

Groups products and counts them per category.

\`\`\`sql
SELECT category, COUNT(*) AS product_count, AVG(price) AS avg_price
FROM products
GROUP BY category
ORDER BY product_count DESC;
\`\`\`

**Use case:** Catalogue analytics — category breakdown.`,
    sql: 'SELECT category, COUNT(*) AS product_count, AVG(price) AS avg_price\nFROM products\nGROUP BY category\nORDER BY product_count DESC;',
  },
  {
    id: 'refund-transactions',
    name: 'Refund Transactions',
    source: 'transactions',
    description: `## Refund Transactions

All transactions of type \`refund\`, most recent first.

\`\`\`sql
SELECT * FROM transactions
WHERE type = 'refund'
ORDER BY processed_at DESC;
\`\`\`

**Use case:** Finance — refund audit trail.`,
    sql: "SELECT * FROM transactions\nWHERE type = 'refund'\nORDER BY processed_at DESC;",
  },
  {
    id: 'large-transactions',
    name: 'Large Transactions',
    source: 'transactions',
    description: `## Large Transactions

Transactions with an amount greater than $200.

\`\`\`sql
SELECT id, order_id, amount, type, processed_at
FROM transactions
WHERE amount > 200
ORDER BY amount DESC;
\`\`\`

**Use case:** Fraud detection — flag high-value transactions.`,
    sql: 'SELECT id, order_id, amount, type, processed_at\nFROM transactions\nWHERE amount > 200\nORDER BY amount DESC;',
  },
  {
    id: 'login-events',
    name: 'Login Events',
    source: 'events',
    description: `## Login Events

All login events with their full payload, most recent first.

\`\`\`sql
SELECT id, user_id, event_type, payload, occurred_at
FROM events
WHERE event_type = 'login'
ORDER BY occurred_at DESC;
\`\`\`

**Use case:** Security — login activity audit.`,
    sql: "SELECT id, user_id, event_type, payload, occurred_at\nFROM events\nWHERE event_type = 'login'\nORDER BY occurred_at DESC;",
  },
  {
    id: 'events-by-type',
    name: 'Events by Type',
    source: 'events',
    description: `## Events by Type

Counts events grouped by type, sorted by frequency descending.

\`\`\`sql
SELECT event_type, COUNT(*) AS event_count
FROM events
GROUP BY event_type
ORDER BY event_count DESC;
\`\`\`

**Use case:** Analytics — event frequency overview.`,
    sql: 'SELECT event_type, COUNT(*) AS event_count\nFROM events\nGROUP BY event_type\nORDER BY event_count DESC;',
  },
]
