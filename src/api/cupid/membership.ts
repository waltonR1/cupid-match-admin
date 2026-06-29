import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidAdminMembershipQuery extends PageDomain {
  keyword?: string
  status?: string
  tier?: string
}

export interface CupidAdminMembershipListItem {
  id: string
  userId: string
  accountName?: string
  userStatus?: string
  planId?: string
  tier: string
  status: string
  startedAt?: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidAdminMembershipDetail extends CupidAdminMembershipListItem {
  preferredLocale?: string
  billingType?: string
  billingPeriod?: string
  validityMonths?: number
  privateIntroductionQuota?: number
  eventQuota?: number
  staffSupportLevel?: string
  conciergePriority?: boolean
}

export interface CupidAdminMembershipStatusPayload {
  status: string
  reason: string
}

export interface CupidAdminMembershipEditPayload {
  tier: string
  startedAt: string
  expiresAt?: string
  reason: string
}

export const listCupidMemberships = (params: CupidAdminMembershipQuery): Promise<TableDataInfo<CupidAdminMembershipListItem>> =>
  request({ url: '/cupid/membership/list', method: 'get', params })

export const getCupidMembershipDetail = (id: string): Promise<AjaxResult<CupidAdminMembershipDetail>> =>
  request({ url: `/cupid/membership/${id}`, method: 'get' })

export const changeCupidMembershipStatus = (id: string, data: CupidAdminMembershipStatusPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/membership/${id}/status`, method: 'post', data })

export const editCupidMembership = (id: string, data: CupidAdminMembershipEditPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/membership/${id}/edit`, method: 'post', data })
