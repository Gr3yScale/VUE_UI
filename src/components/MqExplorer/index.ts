import MqCustomSender from './MqCustomSender.vue'
import MqNamedSender from './MqNamedSender.vue'
import type { PlaygroundEntry } from '@/types/playground'

export { default as MqCustomSender } from './MqCustomSender.vue'
export { default as MqNamedSender } from './MqNamedSender.vue'
export type * from './types'

/**
 * Playground registration entry for the MQ Custom Sender component.
 * Import this into `src/registry.ts` to register it.
 */
export const MqCustomSenderEntry: PlaygroundEntry = {
  id: 'mq-custom-sender',
  label: 'MQ Custom Sender',
  description: 'Send a message via a custom MQ connection',
  component: MqCustomSender,
}

/**
 * Playground registration entry for the MQ Named Sender component.
 * Import this into `src/registry.ts` to register it.
 */
export const MqNamedSenderEntry: PlaygroundEntry = {
  id: 'mq-named-sender',
  label: 'MQ Named Sender',
  description: 'Send a message via a named pre-configured MQ connection',
  component: MqNamedSender,
}
