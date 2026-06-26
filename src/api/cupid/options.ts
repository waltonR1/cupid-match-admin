import request from '@/utils/request'
import type { AjaxResult } from '@/types'

export interface CupidCommonOptionDTO {
  value: string
  label: string
  requiresExtraText?: boolean
}

export type CupidCommonOptionGroups = Record<string, CupidCommonOptionDTO[]>

export interface CupidCommonOptionsData {
  version: string
  unchanged: boolean
  groups?: CupidCommonOptionGroups
  labelGroups?: CupidCommonOptionGroups
}

export interface CupidOptionGroupRow {
  id: string
  groupKey: string
  groupName: string
  groupScope: string
  manageStatus: string
  sortOrder: number
  status: 'enabled' | 'disabled'
  createdAt?: string
  updatedAt?: string
}

export interface CupidOptionValueRow {
  id: string
  groupKey: string
  groupName: string
  optionValue: string
  labelZh: string
  labelFr: string
  labelEn: string
  sortOrder: number
  requiresExtraText: number | boolean
  status: 'enabled' | 'disabled'
  createdAt?: string
  updatedAt?: string
}

export interface CupidOptionValuePayload {
  groupKey?: string
  optionValue?: string
  labelZh?: string
  labelFr?: string
  labelEn?: string
  sortOrder?: number
  requiresExtraText?: boolean | number
  status?: 'enabled' | 'disabled'
}

export function getCupidCommonOptions(params: { lang?: string; version?: string }) {
  return request({ url: '/api/common/options', method: 'get', params })
}

export function listCupidOptionGroups(): Promise<AjaxResult<CupidOptionGroupRow[]>> {
  return request({ url: '/cupid/options/groups', method: 'get' })
}

export function listCupidOptionValues(params: { groupKey?: string }): Promise<AjaxResult<CupidOptionValueRow[]>> {
  return request({ url: '/cupid/options/values', method: 'get', params })
}

export function getCupidOptionValue(id: string): Promise<AjaxResult<CupidOptionValueRow>> {
  return request({ url: `/cupid/options/values/${id}`, method: 'get' })
}

export function createCupidOptionValue(data: CupidOptionValuePayload): Promise<AjaxResult<CupidOptionValueRow>> {
  return request({ url: '/cupid/options/values', method: 'post', data })
}

export function updateCupidOptionValue(id: string, data: CupidOptionValuePayload): Promise<AjaxResult> {
  return request({ url: `/cupid/options/values/${id}`, method: 'post', data })
}
