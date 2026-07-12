import request from '@/utils/request'
import type { AjaxResult } from '@/types'

export type CupidLegalDocumentType = 'terms' | 'privacy'
export type CupidLegalDocumentStatus = 'draft' | 'active' | 'archived'
export type CupidLegalLocale = 'zh' | 'en' | 'fr'

export interface CupidLegalClause {
  number: string
  body: string
}

export interface CupidLegalSection {
  heading: string
  clauses: CupidLegalClause[]
  sortOrder: number
}

export interface CupidLegalDocumentItem {
  id: string
  type: CupidLegalDocumentType
  version: string
  status: CupidLegalDocumentStatus
  title?: string
  localeCount?: number
  effectiveAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidLegalDocumentContent {
  locale: CupidLegalLocale
  title: string
  sections: CupidLegalSection[]
  updatedAt?: string
}

export interface CupidLegalDocumentDetail extends CupidLegalDocumentItem {
  contents: CupidLegalDocumentContent[]
}

export interface CupidLegalDocumentUpdatePayload {
  version: string
  status: CupidLegalDocumentStatus
  effectiveAt: string
  contents: CupidLegalDocumentContent[]
}

export const listCupidLegalDocuments = (params?: { type?: string }): Promise<AjaxResult<CupidLegalDocumentItem[]>> =>
  request({ url: '/cupid/legal/list', method: 'get', params })

export const getCupidLegalDocument = (id: string): Promise<AjaxResult<CupidLegalDocumentDetail>> =>
  request({ url: `/cupid/legal/${id}`, method: 'get' })

export const updateCupidLegalDocument = (id: string, data: CupidLegalDocumentUpdatePayload): Promise<AjaxResult> =>
  request({ url: `/cupid/legal/${id}`, method: 'post', data })

export const createCupidLegalDraft = (type: CupidLegalDocumentType): Promise<AjaxResult<CupidLegalDocumentDetail>> =>
  request({ url: `/cupid/legal/${type}/draft`, method: 'post' })

export const publishCupidLegalDraft = (id: string, data?: { effectiveAt?: string }): Promise<AjaxResult> =>
  request({ url: `/cupid/legal/${id}/publish`, method: 'post', data })
