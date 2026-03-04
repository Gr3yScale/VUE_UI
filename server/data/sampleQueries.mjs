/**
 * Pre-built sample queries for the MongoExplorer UI.
 * Each entry has id, name, description (Markdown), collection, filter, sort, projection.
 */
export const sampleQueries = [
  {
    id: 'active-users',
    name: 'Active Users',
    collection: 'users',
    description: `## Active Users

Finds all users where \`status\` is \`"active"\`, sorted newest first.

Useful for monitoring engaged user accounts and recent sign-ups.

**Use case:** Dashboard — current active user count.`,
    filter: { status: 'active' },
    sort: { createdAt: -1 },
    projection: {},
  },
  {
    id: 'admin-users',
    name: 'Admin Users',
    collection: 'users',
    description: `## Admin Users

Finds all users with \`role\` set to \`"admin"\`.

Use this to audit privileged accounts and ensure only authorised personnel have elevated access.

**Use case:** Security audit — verify admin list.`,
    filter: { role: 'admin' },
    sort: {},
    projection: { name: 1, email: 1, role: 1, createdAt: 1 },
  },
  {
    id: 'pending-orders',
    name: 'Pending Orders',
    collection: 'orders',
    description: `## Pending Orders

Retrieves all orders with \`status === "pending"\`.

These are orders that have been placed but not yet picked up for processing.

**Use case:** Operations — fulfilment queue review.`,
    filter: { status: 'pending' },
    sort: { createdAt: 1 },
    projection: {},
  },
  {
    id: 'high-value-orders',
    name: 'High-Value Orders',
    collection: 'orders',
    description: `## High-Value Orders

Finds orders where \`total >= 500\`, sorted by total descending.

Helpful for identifying VIP customers and large transactions that may require manual review.

**Use case:** Finance — large order reporting.`,
    filter: { total: { $gte: 500 } },
    sort: { total: -1 },
    projection: {},
  },
  {
    id: 'low-stock',
    name: 'Low Stock Products',
    collection: 'products',
    description: `## Low Stock Products

Finds products where \`stock < 10\`, sorted by stock ascending (most critical first).

Use this to trigger restocking workflows before items go out of stock.

**Use case:** Inventory — reorder alert list.`,
    filter: { stock: { $lt: 10 } },
    sort: { stock: 1 },
    projection: {},
  },
  {
    id: 'top-rated',
    name: 'Top Rated Products',
    collection: 'products',
    description: `## Top Rated Products

Returns products with \`rating >= 4.5\`, sorted by rating descending.

Great for featuring highly-reviewed items in storefronts or recommendation engines.

**Use case:** Merchandising — homepage featured products.`,
    filter: { rating: { $gte: 4.5 } },
    sort: { rating: -1 },
    projection: {},
  },
  {
    id: 'active-sessions',
    name: 'Active Sessions',
    collection: 'sessions',
    description: `## Active Sessions

Retrieves all sessions where \`isActive === true\`.

Monitor currently active user sessions in real time to detect anomalies or overly long sessions.

**Use case:** Security monitoring — live session count.`,
    filter: { isActive: true },
    sort: { createdAt: -1 },
    projection: {},
  },
  {
    id: 'long-sessions',
    name: 'Long Sessions',
    collection: 'sessions',
    description: `## Long Sessions

Finds sessions with \`requestCount > 100\`, sorted by request count descending.

High request counts may indicate automated scripts, bots, or power users worth investigating.

**Use case:** Abuse detection — high-activity session review.`,
    filter: { requestCount: { $gt: 100 } },
    sort: { requestCount: -1 },
    projection: {},
  },
  {
    id: 'error-logs',
    name: 'Error Logs',
    collection: 'logs',
    description: `## Error Logs

Fetches all log entries with \`level === "error"\`, sorted newest first.

Essential for on-call engineers to quickly triage production incidents.

**Use case:** On-call — immediate error triage.`,
    filter: { level: 'error' },
    sort: { timestamp: -1 },
    projection: {},
  },
  {
    id: 'warn-logs',
    name: 'Warning Logs',
    collection: 'logs',
    description: `## Warning Logs

Fetches all log entries with \`level === "warn"\`, sorted newest first.

Warnings often precede errors — reviewing them proactively can prevent incidents.

**Use case:** SRE — proactive issue detection.`,
    filter: { level: 'warn' },
    sort: { timestamp: -1 },
    projection: {},
  },
  {
    id: 'auth-service-logs',
    name: 'Auth Service Logs',
    collection: 'logs',
    description: `## Auth Service Logs

Returns all logs emitted by the \`auth\` service, sorted newest first.

Useful when investigating authentication failures or login-related anomalies.

**Use case:** Security — auth service audit trail.`,
    filter: { service: 'auth' },
    sort: { timestamp: -1 },
    projection: {},
  },
  {
    id: 'all-products',
    name: 'All Products',
    collection: 'products',
    description: `## All Products

Returns the full product catalogue sorted alphabetically by name.

A simple starting point for browsing or bulk export of the product inventory.

**Use case:** Catalogue review — full product listing.`,
    filter: {},
    sort: { name: 1 },
    projection: {},
  },
]
