import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidContactLeadQuery extends PageDomain {
  keyword?: string
  inquiryType?: string
  contactChannel?: string
  status?: string
}

export interface CupidContactLeadItem {
  id: string
  source?: string
  inquiryType: string
  name?: string
  contactChannel: string
  contactValue: string
  message: string
  status: string
  handlerSysUserId?: number
  handlerUserName?: string
  handlerNickName?: string
  handlerNote?: string
  handledAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidContactLeadHandlePayload {
  status: string
  handlerNote?: string
}

export const listCupidContactLeads = (params: CupidContactLeadQuery): Promise<TableDataInfo<CupidContactLeadItem>> =>
  request({ url: '/cupid/contact-lead/list', method: 'get', params })

export const getCupidContactLead = (id: string): Promise<AjaxResult<CupidContactLeadItem>> =>
  request({ url: `/cupid/contact-lead/${id}`, method: 'get' })

export const handleCupidContactLead = (id: string, data: CupidContactLeadHandlePayload): Promise<AjaxResult> =>
  request({ url: `/cupid/contact-lead/${id}/handle`, method: 'post', data })
