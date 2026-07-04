import request from '@/utils/request'
import type { AjaxResult } from '@/types'

export interface CupidRedisMetric {
  code: string
  name: string
  pattern: string
  count: number
}

export interface CupidMonitorOverview {
  checkedAt: number
  status: 'healthy' | 'unavailable'
  totalCupidKeys: number
  activeSessions: number
  onlineUsers: number
  verificationCodes: number
  riskCounters: number
  activeChallengeTokens: number
  redisMetrics: CupidRedisMetric[]
  operations: {
    messageSuccessCount: number
    messageFailureCount: number
    pendingRetryCount: number
    exhaustedRetryCount: number
    activeUserCount: number
    activeMembershipCount: number
    confirmedEventRegistrationCount: number
  }
}

export const getCupidMonitorOverview = (): Promise<AjaxResult<CupidMonitorOverview>> =>
  request({ url: '/cupid/monitor/overview', method: 'get' })
