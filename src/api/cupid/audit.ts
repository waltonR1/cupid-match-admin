import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidAdminAuditQuery extends PageDomain {
  action?: string
  subjectType?: string
  subjectId?: string
  operatorKeyword?: string
  dateFrom?: string
  dateTo?: string
}

export interface CupidAdminAuditListItem {
  id: string
  actorType: string
  actorUserId?: string
  actorUserName?: string
  actorNickName?: string
  actorDisplayName?: string
  subjectType: string
  subjectId: string
  action: string
  reason?: string
  createdAt: string
}

export interface CupidAdminAuditDetail extends CupidAdminAuditListItem {
  beforeData?: string
  afterData?: string
}

export const listCupidAuditLogs = (params: CupidAdminAuditQuery): Promise<TableDataInfo<CupidAdminAuditListItem>> =>
  request({ url: '/cupid/audit/list', method: 'get', params })

export const getCupidAuditDetail = (id: string): Promise<AjaxResult<CupidAdminAuditDetail>> =>
  request({ url: `/cupid/audit/${id}`, method: 'get' })
