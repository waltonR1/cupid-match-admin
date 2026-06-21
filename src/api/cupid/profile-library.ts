import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listProfileLibrary(query: Record<string, any>): Promise<TableDataInfo<any[]>> {
  return request({ url: '/cupid/profile-library/list', method: 'get', params: query })
}

export function getProfileLibrary(id: string): Promise<AjaxResult> {
  return request({ url: `/cupid/profile-library/${id}`, method: 'get' })
}
