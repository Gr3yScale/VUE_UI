import SqlExplorer from './SqlExplorer.vue'
import type { PlaygroundEntry } from '@/types/playground'

export { default as SqlExplorer } from './SqlExplorer.vue'
export type * from './types'

/**
 * Playground registration entry for the SqlExplorer component.
 * Import this into `src/registry.ts` to register it.
 */
export const SqlExplorerEntry: PlaygroundEntry = {
  id: 'sql-explorer',
  label: 'SQL Explorer',
  description: 'SQL query tool with syntax highlighting',
  component: SqlExplorer,
}
