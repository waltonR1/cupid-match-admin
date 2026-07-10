import request from '@/utils/request'
import type { AjaxResult, PageDomain, TableDataInfo } from '@/types'

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

export interface CupidPaymentRecordItem {
  id: string
  orderId?: string
  provider?: string
  environment?: string
  paymentId?: string
  invoiceId?: string
  subscriptionId?: string
  chargeId?: string
  checkoutSessionId?: string
  status?: string
  rawStatus?: string
  amountCents?: number
  currency?: string
  failureReason?: string
  paidAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidPaymentOrderDetail extends CupidPaymentOrderItem {
  planId?: string
  customerId?: string
  failureReason?: string
  cancelledAt?: string
  localSubscriptionId?: string
  subscriptionStatus?: string
  priceId?: string
  currentPeriodStartedAt?: string
  currentPeriodEndsAt?: string
  cancelAtPeriodEnd?: boolean | number
  subscriptionCancelledAt?: string
  membershipId?: string
  membershipStatus?: string
  membershipStartedAt?: string
  membershipExpiresAt?: string
  payments?: CupidPaymentRecordItem[]
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

export interface CupidPaymentWebhookDetail extends CupidPaymentWebhookItem {
  payloadJson?: string
  createdAt?: string
  updatedAt?: string
}

export interface CupidPaymentStripeLink {
  type: string
  label: string
  externalId: string
  url: string
}

export interface CupidPaymentStripeLinksResult {
  links: CupidPaymentStripeLink[]
}

export const listCupidPaymentOrders = (params: CupidPaymentOrderQuery): Promise<TableDataInfo<CupidPaymentOrderItem>> =>
  request({ url: '/cupid/payment/orders/list', method: 'get', params })

export const getCupidPaymentOrder = (id: string): Promise<AjaxResult<CupidPaymentOrderDetail>> =>
  request({ url: `/cupid/payment/orders/${id}`, method: 'get' })

export const getCupidPaymentStripeLinks = (id: string): Promise<AjaxResult<CupidPaymentStripeLinksResult>> =>
  request({ url: `/cupid/payment/orders/${id}/stripe-links`, method: 'get' })

export const listCupidPaymentWebhooks = (params: CupidPaymentWebhookQuery): Promise<TableDataInfo<CupidPaymentWebhookItem>> =>
  request({ url: '/cupid/payment/webhooks/list', method: 'get', params })

export const getCupidPaymentWebhook = (id: string): Promise<AjaxResult<CupidPaymentWebhookDetail>> =>
  request({ url: `/cupid/payment/webhooks/${id}`, method: 'get' })
