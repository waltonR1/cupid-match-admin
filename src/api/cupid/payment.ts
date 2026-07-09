import request from '@/utils/request'
import type { PageDomain, TableDataInfo } from '@/types'

export interface CupidPaymentOrderQuery extends PageDomain {
  keyword?: string
  status?: string
  tier?: string
}

export interface CupidPaymentWebhookQuery extends PageDomain {
  eventType?: string
  processStatus?: string
}

export interface CupidPaymentOrderItem {
  id: string
  userId: string
  accountName?: string
  tier?: string
  orderType?: string
  provider?: string
  environment?: string
  amountCents?: number
  currency?: string
  status?: string
  checkoutSessionId?: string
  subscriptionId?: string
  customerId?: string
  paidAt?: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidPaymentWebhookItem {
  id: string
  provider?: string
  environment?: string
  eventId?: string
  eventType?: string
  processStatus?: string
  processMessage?: string
  receivedAt?: string
  processedAt?: string
}

export const listCupidPaymentOrders = (params: CupidPaymentOrderQuery): Promise<TableDataInfo<CupidPaymentOrderItem>> =>
  request({ url: '/cupid/payment/orders/list', method: 'get', params })

export const listCupidPaymentWebhooks = (params: CupidPaymentWebhookQuery): Promise<TableDataInfo<CupidPaymentWebhookItem>> =>
  request({ url: '/cupid/payment/webhooks/list', method: 'get', params })
