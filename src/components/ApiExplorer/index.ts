import ApiExplorer from './ApiExplorer.vue'
import type { PlaygroundEntry } from '@/types/playground'

export { default as ApiExplorer } from './ApiExplorer.vue'
export type * from './types'

/**
 * Playground registration entry for the ApiExplorer component.
 * Import this into `src/registry.ts` to register it.
 */
export const ApiExplorerEntry: PlaygroundEntry = {
  id: 'api-explorer',
  label: 'API Explorer',
  description: 'HTTP request tool with mock API responses',
  component: ApiExplorer,
}
