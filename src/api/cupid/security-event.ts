import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidSecurityEventQuery extends PageDomain {
  userId?: string
  eventType?: string
  eventResult?: string
  keyword?: string
  dateFrom?: string
  dateTo?: string
}

export interface CupidSecurityEventListItem {
  id: string
  userId?: string
  identityId?: string
  eventType: string
  eventResult: string
  riskLevel?: string
  ip?: string
  userAgent?: string
  deviceId?: string
  accountName?: string
  provider?: string
  createdAt: string
}

export interface CupidSecurityEventDetail extends CupidSecurityEventListItem {
  detailJson?: string
}

export const listCupidSecurityEvents = (
  params: CupidSecurityEventQuery
): Promise<TableDataInfo<CupidSecurityEventListItem>> =>
  request({ url: '/cupid/security-event/list', method: 'get', params })

export const getCupidSecurityEventDetail = (id: string): Promise<AjaxResult<CupidSecurityEventDetail>> =>
  request({ url: `/cupid/security-event/${id}`, method: 'get' })
