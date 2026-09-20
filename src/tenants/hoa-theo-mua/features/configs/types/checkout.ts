/** Document `checkout.payment_methods` / `checkout.delivery_methods`. */
import type { LocalizedText } from './localized'

export type CheckoutMethodKind = 'payment' | 'delivery'

export const PaymentGateway = {
  BaoKim: 1,
  Sepay: 2
} as const

export const ShippingGateway = {
  Ahamove: 1,
  XanhSm: 2
} as const

export type PaymentGatewayValue = (typeof PaymentGateway)[keyof typeof PaymentGateway]
export type ShippingGatewayValue = (typeof ShippingGateway)[keyof typeof ShippingGateway]
export type CheckoutGatewayValue = PaymentGatewayValue | ShippingGatewayValue

export interface CheckoutMethodItem {
  id: string
  enabled: boolean
  isDefault: boolean
  label: LocalizedText
  description: LocalizedText
  gateway: CheckoutGatewayValue
  gatewayName: string
}

export interface CheckoutMethodsCollection {
  items: CheckoutMethodItem[]
}

/** Phương thức do code quản mà storefront hỗ trợ; document đã lưu được đối chiếu lại với nó. */
export interface CheckoutMethodDefinition {
  id: string
  label: LocalizedText
  description: LocalizedText
  gateway: CheckoutGatewayValue
  gatewayName: string
}
