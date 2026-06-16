import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export interface ReviewPayload {
  status: 'approved' | 'rejected'
  reason: string
}

export function listProfiles(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/profile/list', method: 'get', params: query })
}

export function getProfile(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/profile/${id}`, method: 'get' })
}

export function reviewProfile(id: string, data: ReviewPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/profile/${id}/review`, method: 'post', data })
}

export function listPhotos(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/photo/list', method: 'get', params: query })
}

export function getPhoto(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/photo/${id}`, method: 'get' })
}

export function reviewPhoto(id: string, data: ReviewPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/photo/${id}/review`, method: 'post', data })
}

export function listVerifications(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/verification/list', method: 'get', params: query })
}

export function getVerification(profileId: string): Promise<AjaxResult> {
  return request({ url: `/cupid/verification/${profileId}`, method: 'get' })
}

export function reviewVerification(profileId: string, data: ReviewPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/verification/${profileId}/review`, method: 'post', data })
}
