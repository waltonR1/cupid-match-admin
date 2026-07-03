import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

export interface CupidAdminStaffTaskQuery extends PageDomain {
  keyword?: string
  subjectType?: string
  status?: string
  priority?: string
  assigneeSysUserId?: string
}

export interface CupidAdminStaffTaskAssignee {
  userId: number
  userName: string
  nickName?: string
}

export interface CupidAdminStaffTaskListItem {
  id: string
  assigneeSysUserId?: number
  assigneeUserName?: string
  assigneeNickName?: string
  subjectType: string
  subjectId: string
  status: string
  priority: string
  dueAt?: string
  overdue?: boolean | number
  completedAt?: string
  createdAt: string
  updatedAt?: string
  noteZh?: string
}

export interface CupidAdminStaffTaskDetail extends CupidAdminStaffTaskListItem {
  noteFr?: string
  noteEn?: string
}

export interface CupidAdminStaffTaskPayload {
  assigneeSysUserId?: number | string
  subjectType: string
  subjectId: string
  status?: string
  priority?: string
  dueAt?: string
  noteZh?: string
  noteFr?: string
  noteEn?: string
}

export const listCupidStaffTasks = (params: CupidAdminStaffTaskQuery): Promise<TableDataInfo<CupidAdminStaffTaskListItem>> =>
  request({ url: '/cupid/staff-task/list', method: 'get', params })

export const getCupidStaffTaskDetail = (id: string): Promise<AjaxResult<CupidAdminStaffTaskDetail>> =>
  request({ url: `/cupid/staff-task/${id}`, method: 'get' })

export const listCupidStaffTaskAssignees = (): Promise<AjaxResult<CupidAdminStaffTaskAssignee[]>> =>
  request({ url: '/cupid/staff-task/assignees', method: 'get' })

export const createCupidStaffTask = (data: CupidAdminStaffTaskPayload): Promise<AjaxResult> =>
  request({ url: '/cupid/staff-task', method: 'post', data })

export const editCupidStaffTask = (id: string, data: CupidAdminStaffTaskPayload): Promise<AjaxResult> =>
  request({ url: `/cupid/staff-task/${id}/edit`, method: 'post', data })
