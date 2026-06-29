import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export interface InboxLocalizedField { locale: 'zh' | 'fr' | 'en'; name: string; body: string }
export interface InboxTemplate {
  id: string; templateCode: string; messageType: string; subjectType?: string; actionType?: string
  status: 'enabled' | 'disabled'; localeCount?: number; localizedFields?: InboxLocalizedField[]; updatedAt?: string
}
export interface InboxUser { id: string; accountName: string; preferredLocale: string }
export interface InboxSubject { id: string; label: string }

export const listInboxTemplates = (params: Record<string, unknown>): Promise<TableDataInfo<InboxTemplate>> =>
  request({ url: '/cupid/inboxTemplate/list', method: 'get', params })
export const getInboxTemplate = (id: string): Promise<AjaxResult<InboxTemplate>> =>
  request({ url: `/cupid/inboxTemplate/${id}`, method: 'get' })
export const addInboxTemplate = (data: Partial<InboxTemplate>): Promise<AjaxResult> =>
  request({ url: '/cupid/inboxTemplate', method: 'post', data })
export const updateInboxTemplate = (id: string, data: Partial<InboxTemplate>): Promise<AjaxResult> =>
  request({ url: `/cupid/inboxTemplate/${id}`, method: 'put', data })
export const changeInboxTemplateStatus = (id: string, status: string): Promise<AjaxResult> =>
  request({ url: `/cupid/inboxTemplate/${id}/status`, method: 'post', data: { status } })

export const searchInboxUsers = (keyword = ''): Promise<AjaxResult<InboxUser[]>> =>
  request({ url: '/cupid/inbox/users', method: 'get', params: { keyword } })
export const searchInboxSubjects = (userId: string, subjectType: string, keyword = ''): Promise<AjaxResult<InboxSubject[]>> =>
  request({ url: '/cupid/inbox/subjects', method: 'get', params: { userId, subjectType, keyword } })
export const getEnabledInboxTemplates = (): Promise<AjaxResult<InboxTemplate[]>> =>
  request({ url: '/cupid/inbox/templates', method: 'get' })
export const previewInboxMessage = (data: Record<string, unknown>): Promise<AjaxResult<Record<string, unknown>>> =>
  request({ url: '/cupid/inbox/preview', method: 'post', data })
export const sendInboxMessage = (data: Record<string, unknown>): Promise<AjaxResult> =>
  request({ url: '/cupid/inbox/notify', method: 'post', data })
export const previewInboxBroadcast = (data: Record<string, unknown>): Promise<AjaxResult<Record<string, unknown>>> =>
  request({ url: '/cupid/inbox/broadcast/preview', method: 'post', data })
export const sendInboxBroadcast = (data: Record<string, unknown>): Promise<AjaxResult<Record<string, unknown>>> =>
  request({ url: '/cupid/inbox/broadcast', method: 'post', data })
