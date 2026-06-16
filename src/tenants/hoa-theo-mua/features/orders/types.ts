import type { I18nKey } from '@/lib/i18n/types'

export const OrderStatus = {
  Paid: 'Paid',
  Pending: 'Pending'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, I18nKey> = {
  [OrderStatus.Paid]: 'orders.status.paid',
  [OrderStatus.Pending]: 'orders.status.pending'
}

export interface OrderRow {
  orderId: string
  status: OrderStatus
  trackNumber: string
  nhanhOrderId: string
  nhanhTrackingUrl: string
  ahahaMoveOrderId: string
  ahahaMoveTrackingUrl: string
  createAt: string
  updateAt: string
}
