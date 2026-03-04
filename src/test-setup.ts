import { vi } from 'vitest'

// Provide a global fetch mock — individual tests override via vi.mocked(fetch).mockResolvedValue(...)
globalThis.fetch = vi.fn() as unknown as typeof fetch
