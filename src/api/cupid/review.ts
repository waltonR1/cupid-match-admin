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

export interface IntroductionActionPayload {
  reason?: string
}

export interface IntroductionNotePayload {
  note: string
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

export function listIntroductions(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/introduction/list', method: 'get', params: query })
}

export function getIntroduction(requestId: string): Promise<AjaxResult> {
  return request({ url: `/cupid/introduction/${requestId}`, method: 'get' })
}

export function acceptIntroduction(requestId: string, data: IntroductionActionPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/introduction/${requestId}/accept`, method: 'post', data })
}

export function declineIntroduction(requestId: string, data: IntroductionActionPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/introduction/${requestId}/decline`, method: 'post', data })
}

export function noteIntroduction(requestId: string, data: IntroductionNotePayload): Promise<AjaxResult> {
  return request({ url: `/cupid/introduction/${requestId}/note`, method: 'post', data })
}

export function resetVerification(data: VerificationResetPayload): Promise<AjaxResult> {
  return request({ url: '/cupid/verification/reset', method: 'post', data })
}

// -- Event & Registration --

export interface EventStatusPayload {
  status: string
  reason: string
}

export interface EventCreatePayload {
  title: string
  status?: string
  visibility: string
  consumesMembershipQuota: boolean
  cityCode: string
  addressVisibility: string
  eventDate: string
  startTime: string
  endTime: string
  capacity: number
  coverImageUrl?: string
  languageCodes?: string[]
  relationshipFocus?: string[]
  summary?: string
  venue?: string
  address?: string
  format?: string
  audience?: string
  noteItems?: Array<{
    title: string
    description: string
  }>
  agendaItems?: Array<{
    time: string
    title: string
    description: string
  }>
}

export interface RegistrationReviewPayload {
  status: 'requested' | 'confirmed' | 'declined' | 'waitlist' | 'cancelled' | 'attended'
  reason: string
}

export function listAdminEvents(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/event/list', method: 'get', params: query })
}

export function getAdminEvent(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/event/${id}`, method: 'get' })
}

export function createAdminEvent(data: EventCreatePayload): Promise<AjaxResult> {
  return request({ url: '/cupid/event', method: 'post', data })
}

export function updateAdminEvent(id: string, data: EventCreatePayload): Promise<AjaxResult> {
  return request({ url: `/cupid/event/${id}`, method: 'put', data })
}

export function changeEventStatus(id: string, data: EventStatusPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/event/${id}/status`, method: 'post', data })
}

export function uploadCommonFile(data: FormData): Promise<AjaxResult> {
  return request({
    url: '/common/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function listAdminRegistrations(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/eventRegistration/list', method: 'get', params: query })
}

export function getAdminRegistration(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/eventRegistration/${id}`, method: 'get' })
}

export function reviewRegistration(id: string, data: RegistrationReviewPayload): Promise<AjaxResult> {
  return request({ url: `/cupid/eventRegistration/${id}/review`, method: 'post', data })
}
