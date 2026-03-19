import { randomUUID } from 'node:crypto'

/** @type {Map<string, {type: string, source?: string, env?: string, channel?: string, services?: string[], messageRef?: string, createdAt: number, stopped: boolean, stoppedAt?: string}>} */
export const tasks = new Map()

export function createTask(type, extras = {}) {
  const taskId = randomUUID()
  const task = { type, createdAt: Date.now(), stopped: false, ...extras }
  tasks.set(taskId, task)
  return taskId
}

export function getMockStatus(taskId, task) {
  if (task.stopped) {
    return {
      taskId,
      status: 'STOPPED',
      message: 'Task was cancelled by user',
      stoppedAt: task.stoppedAt,
    }
  }

  const elapsed = Date.now() - task.createdAt

  if (elapsed < 3000) {
    return {
      taskId,
      status: 'RUNNING',
      phase: 'INITIALISING',
      progress: 0,
      message: 'Initialising task…',
    }
  }
  if (elapsed < 8000) {
    const pct = Math.round(((elapsed - 3000) / 5000) * 50)
    return {
      taskId,
      status: 'RUNNING',
      phase: 'PROCESSING',
      progress: pct,
      message: 'Processing…',
      ...(task.source ? { source: task.source } : {}),
      ...(task.services ? { services: task.services } : {}),
    }
  }
  if (elapsed < 15000) {
    const pct = 50 + Math.round(((elapsed - 8000) / 7000) * 45)
    return {
      taskId,
      status: 'RUNNING',
      phase: 'FINALISING',
      progress: pct,
      message: 'Finalising…',
    }
  }

  return {
    taskId,
    status: 'COMPLETED',
    phase: 'DONE',
    progress: 100,
    message: 'Task completed successfully',
    result: {
      success: true,
      processedAt: new Date(task.createdAt + 15000).toISOString(),
      ...(task.source ? { source: task.source, environment: task.env } : {}),
      ...(task.messageRef ? { messageRef: task.messageRef } : {}),
    },
  }
}

const CHANNELS = {
  GPP_UK: {
    DEV: ['CH.DEV.UK.01', 'CH.DEV.UK.02'],
    SIT: ['CH.SIT.UK.01'],
    UAT: ['CH.UAT.UK.01', 'CH.UAT.UK.02'],
    PROD: ['CH.PROD.UK.01', 'CH.PROD.UK.02', 'CH.PROD.UK.03'],
  },
  GPP_EU: {
    DEV: ['CH.DEV.EU.01'],
    SIT: ['CH.SIT.EU.01', 'CH.SIT.EU.02'],
    UAT: ['CH.UAT.EU.01'],
    PROD: ['CH.PROD.EU.01', 'CH.PROD.EU.02'],
  },
  GPP_US: {
    DEV: ['CH.DEV.US.01', 'CH.DEV.US.02'],
    SIT: ['CH.SIT.US.01'],
    UAT: ['CH.UAT.US.01'],
    PROD: ['CH.PROD.US.01'],
  },
}

export function getChannels(source, env) {
  return CHANNELS[source]?.[env] ?? []
}

// Pre-seed a few tasks so the dashboard is not empty on first load
;(function seedInitialTasks() {
  const now = Date.now()

  // Two completed (stored) tasks
  const t1 = randomUUID()
  tasks.set(t1, { type: 'INJECTION', source: 'GPP_UK', env: 'SIT', channel: 'CH.SIT.UK.01', createdAt: now - 20000, stopped: false })

  const t2 = randomUUID()
  tasks.set(t2, { type: 'TRACKING', services: ['payment-svc', 'audit-svc'], messageRef: 'MSG-00001', createdAt: now - 25000, stopped: false })

  // Two active (running) tasks
  const t3 = randomUUID()
  tasks.set(t3, { type: 'INJECTION', source: 'GPP_EU', env: 'DEV', channel: 'CH.DEV.EU.01', createdAt: now - 4000, stopped: false })

  const t4 = randomUUID()
  tasks.set(t4, { type: 'TRACKING', services: ['order-svc'], messageRef: 'MSG-00002', createdAt: now - 1000, stopped: false })
})()
