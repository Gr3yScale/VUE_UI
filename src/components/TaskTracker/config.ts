import type { DataSource, QMSEnvironment } from './types'

export const API_BASE_URL = 'http://localhost:3001'

/** Interval (ms) during the fast polling phase. */
export const POLL_FAST_MS = 500

/** Interval (ms) after the fast polling phase ends. */
export const POLL_SLOW_MS = 1000

/** Duration (ms) of the fast polling phase before transitioning to slow. */
export const POLL_FAST_DURATION_MS = 2000

export const DATA_SOURCES: DataSource[] = ['GPP_UK', 'GPP_EU', 'GPP_US']
export const QMS_ENVIRONMENTS: QMSEnvironment[] = ['DEV', 'SIT', 'UAT', 'PROD']
