import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidAdminUserQuery extends PageDomain {
  keyword?: string
  status?: string
  membershipTier?: string
  online?: '1' | '0'
}

export interface CupidAdminUserListItem {
  id: string
  accountName: string
  avatarUrl?: string
  preferredLocale?: string
  status: string
  membershipTier?: string
  membershipStatus?: string
  membershipExpiresAt?: string
  profileCount?: number
  selfProfileCount?: number
  selfProfileStatus?: string
  sessionCount?: number
  lastLoginAt?: number | string
  online?: boolean
  createdAt: string
  updatedAt?: string
}

export interface CupidAdminUserIdentity {
  id: string
  provider: string
  identifier?: string
  maskedIdentifier?: string
  verifiedAt?: string
  createdAt?: string
}

export interface CupidAdminUserProfileContact {
  profileId: string
  profileType: string
  phone?: string
  email?: string
  wechat?: string
  preferredChannel?: string
  visibility?: string
}

export interface CupidAdminUserSession {
  sessionId: string
  identityId?: string
  provider?: string
  maskedIdentifier?: string
  createdAt: number
  expiresAt: number
}

export interface CupidAdminUserDetail extends CupidAdminUserListItem {
  membershipId?: string
  planId?: string
  membershipStartedAt?: string
  preferredCityCode?: string
  preferredContactChannel?: string
  staffContactEnabled?: boolean
  familyAssistEnabled?: boolean
  introductionUpdatesEnabled?: boolean
  eventRemindersEnabled?: boolean
  serviceAnnouncementsEnabled?: boolean
  marketingEmailsEnabled?: boolean
  analyticsConsentEnabled?: boolean
  mfaEnabled?: boolean
  mfaMethod?: string
  mfaEnabledAt?: string
  identityCount?: number
  openProfileCount?: number
  eventRegistrationCount?: number
  identities: CupidAdminUserIdentity[]
  profiles: Array<Record<string, any>>
  recentEvents: Array<Record<string, any>>
  profileContacts: CupidAdminUserProfileContact[]
  sessions: CupidAdminUserSession[]
}

export interface CupidAdminUserStatusPayload {
  status: 'active' | 'banned'
  reason: string
}

export interface CupidAdminReasonPayload {
  reason: string
}

export interface CupidAdminSensitiveResult {
  identities: CupidAdminUserIdentity[]
  profileContacts: CupidAdminUserProfileContact[]
}

export const listCupidUsers = (params: CupidAdminUserQuery): Promise<TableDataInfo<CupidAdminUserListItem>> =>
  request({ url: '/cupid/user/list', method: 'get', params })

export const getCupidUserDetail = (id: string): Promise<AjaxResult<CupidAdminUserDetail>> =>
  request({ url: `/cupid/user/${id}`, method: 'get' })

export const getCupidUserSessions = (id: string): Promise<AjaxResult<CupidAdminUserSession[]>> =>
  request({ url: `/cupid/user/${id}/sessions`, method: 'get' })

export const changeCupidUserStatus = (id: string, data: CupidAdminUserStatusPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/user/${id}/status`, method: 'post', data })

export const kickCupidUserSession = (id: string, sessionId: string, data?: CupidAdminReasonPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/user/${id}/sessions/${sessionId}`, method: 'delete', data })

export const kickAllCupidUserSessions = (id: string, data?: CupidAdminReasonPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/user/${id}/sessions`, method: 'delete', data })

export const viewCupidUserSensitive = (id: string, data: CupidAdminReasonPayload): Promise<AjaxResult<CupidAdminSensitiveResult>> =>
  request({ url: `/cupid/user/${id}/sensitive/view`, method: 'post', data })
