import MongoExplorer from './MongoExplorer.vue'
import type { PlaygroundEntry } from '@/types/playground'

export { default as MongoExplorer } from './MongoExplorer.vue'
export type * from './types'

/**
 * Playground registration entry for the MongoExplorer component.
 * Import this into `src/registry.ts` to register it.
 */
export const MongoExplorerEntry: PlaygroundEntry = {
  id: 'mongo-explorer',
  label: 'Mongo Explorer',
  description: 'MongoDB Compass-style query tool',
  component: MongoExplorer,
}
