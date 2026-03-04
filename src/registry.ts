import type { PlaygroundRegistry } from './types/playground'
import { MongoExplorerEntry } from './components/MongoExplorer'
import { SqlExplorerEntry } from './components/SqlExplorer'
import { ApiExplorerEntry } from './components/ApiExplorer'

/**
 * All registered playground components.
 * Add new entries here when creating additional components.
 */
export const registry: PlaygroundRegistry = [MongoExplorerEntry, SqlExplorerEntry, ApiExplorerEntry]
