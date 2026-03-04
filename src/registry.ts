import type { PlaygroundRegistry } from './types/playground'
import { MongoExplorerEntry } from './components/MongoExplorer'

/**
 * All registered playground components.
 * Add new entries here when creating additional components.
 */
export const registry: PlaygroundRegistry = [MongoExplorerEntry]
