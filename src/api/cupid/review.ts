import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export interface ReviewPayload {
  status: 'approved' | 'rejected'
  reason: string
}

export interface VerificationResetPayload {
  profileId: string
  materialType: string
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

export function getVerification(materialId: string): Promise<AjaxResult> {
  return request({ url: `/cupid/verification/${materialId}`, method: 'get' })
}

export function reviewVerification(materialId: string, data: ReviewPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/verification/${materialId}/review`, method: 'post', data })
}

export function previewVerificationMaterial(materialId: string): Promise<Blob> {
  return request({ url: `/cupid/verification/${materialId}/material/preview`, method: 'get', responseType: 'blob' })
}

export function downloadVerificationMaterial(materialId: string): Promise<Blob> {
  return request({ url: `/cupid/verification/${materialId}/material/download`, method: 'get', responseType: 'blob' })
}

export function createAdminVerificationMaterial(data: Record<string, string>, file: File): Promise<AjaxResult> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''))
  formData.append('file', file)
  return request({
    url: '/cupid/verification/material/create',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function resetVerification(data: VerificationResetPayload): Promise<AjaxResult> {
  return request({ url: '/cupid/verification/reset', method: 'post', data })
}
