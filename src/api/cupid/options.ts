
import request from '@/utils/request'

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
}

export function getCupidCommonOptions(params: { lang?: string; version?: string }) {
  return request({ url: '/api/common/options', method: 'get', params })
}
