import type { PlaygroundEntry } from '../../types/playground'
import TaskDashboard from './TaskDashboard.vue'
import TaskLookup from './TaskLookup.vue'
import TaskCreateInjection from './TaskCreateInjection.vue'
import TaskCreateTracking from './TaskCreateTracking.vue'

/** Lists active and stored tasks; click any ID to open the live viewer. */
export const TaskDashboardEntry: PlaygroundEntry = {
  id: 'task-dashboard',
  label: 'Task Dashboard',
  description: 'View active and stored task results',
  component: TaskDashboard,
}

/** Enter a task ID to open the live polling viewer. */
export const TaskLookupEntry: PlaygroundEntry = {
  id: 'task-lookup',
  label: 'Look Up Task',
  description: 'Find a task by ID and monitor it',
  component: TaskLookup,
}

/** Create a payment injection task and follow it live. */
export const TaskCreateInjectionEntry: PlaygroundEntry = {
  id: 'task-create-injection',
  label: 'Injection Task',
  description: 'Submit a GPP payment injection',
  component: TaskCreateInjection,
}

/** Create a tracking task and follow it live. */
export const TaskCreateTrackingEntry: PlaygroundEntry = {
  id: 'task-create-tracking',
  label: 'Tracking Task',
  description: 'Track a message across services',
  component: TaskCreateTracking,
}
