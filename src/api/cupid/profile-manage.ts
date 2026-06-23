import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export interface InternalLocalizedField {
  fieldName: 'employer' | 'income_range' | 'staff_notes'
  locale: 'zh' | 'fr' | 'en'
  value: string
}

export interface ProfileInternalPayload {
  isFeatured?: boolean | number
  localizedFields?: InternalLocalizedField[]
}

export interface ProfileNotesPayload {
  localizedFields: InternalLocalizedField[]
}

export function listProfileManage(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/profile-manage/list', method: 'get', params: query })
}

export function getProfileManage(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/profile-manage/${id}`, method: 'get' })
}

export function getProfileManageNotes(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/profile-manage/${id}/notes`, method: 'get' })
}

export function updateProfileManageInternal(id: string, data: ProfileInternalPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/profile-manage/${id}/internal`, method: 'post', data })
}

export function updateProfileManageNotes(id: string, data: ProfileNotesPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/profile-manage/${id}/notes`, method: 'post', data })
}
