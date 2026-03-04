import type { Component } from 'vue'

/**
 * Describes a single registered playground component entry.
 */
export interface PlaygroundEntry {
  /** Unique identifier used as the registry key. */
  id: string
  /** Display name shown in the sidebar. */
  label: string
  /** Short description shown under the label. */
  description: string
  /** The Vue component to render in the main area. */
  component: Component
}

/** The full registry of all available playground components. */
export type PlaygroundRegistry = PlaygroundEntry[]
