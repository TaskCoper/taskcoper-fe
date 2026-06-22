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

export interface NhanhVnProduct {
  name: string
  code: string
  quantity: number
  price: number
  image?: string
}

export interface NhanhVnOrder {
  info: {
    id: number
    depotId?: number
    saleName?: string
    trackingUrl?: string
    createdAt?: number
  }
  channel?: {
    trafficSource?: string
  }
  shippingAddress?: {
    address?: string
    location?: string
    mobile?: string
  }
  products: NhanhVnProduct[]
  carrier?: {
    name?: string
  }
  payment?: {
    transfer?: {
      amount?: number
    }
  }
}

export interface NhanhVnOrdersRequest {
  filters?: {
    createdAtFrom?: number
    createdAtTo?: number
    ids?: number[]
    depotIds?: number[]
  }
  paginator?: {
    size?: number
    next?: { id: number }
  }
  dataOptions?: Record<string, unknown>
}

export interface GetOrdersNhanhVnParams {
  createdAtFrom?: number
  createdAtTo?: number
  ids?: number[]
  depotIds?: number[]
  size?: number
  nextCursor?: { id: number }
}

export type ShippingLocationType = 'CITY' | 'WARD'

export interface ShippingLocation {
  id: number
  name: string
}
