import { parseLocalizedText, safeJsonParse, type LocalizedText } from './palette-shared'

export const CHECKOUT_CONFIG_GROUP = 'checkout'
export const CHECKOUT_PAYMENT_METHODS_KEY = 'checkout.payment_methods'
export const CHECKOUT_DELIVERY_METHODS_KEY = 'checkout.delivery_methods'

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

interface CheckoutMethodDefinition {
  id: string
  label: LocalizedText
  description: LocalizedText
  gateway: CheckoutGatewayValue
  gatewayName: string
}

export const PAYMENT_METHOD_REGISTRY: readonly CheckoutMethodDefinition[] = [
  {
    id: 'baokim-va',
    label: { vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer' },
    description: {
      vi: 'Thanh toán qua tài khoản định danh của Bảo Kim.',
      en: 'Pay through a BaoKim virtual account.'
    },
    gateway: PaymentGateway.BaoKim,
    gatewayName: 'BaoKim'
  },
  {
    id: 'sepay-vnpay-qr',
    label: { vi: 'Quét mã VietQR', en: 'VietQR payment' },
    description: {
      vi: 'Quét mã QR bằng ứng dụng ngân hàng của bạn.',
      en: 'Scan a QR code with your banking app.'
    },
    gateway: PaymentGateway.Sepay,
    gatewayName: 'Sepay'
  }
]

export const DELIVERY_METHOD_REGISTRY: readonly CheckoutMethodDefinition[] = [
  {
    id: 'ahamove-sgn-bike',
    label: { vi: 'Ahamove xe máy', en: 'Ahamove Bike' },
    description: { vi: 'Giao hoa nhanh bằng xe máy.', en: 'Fast flower delivery by motorbike.' },
    gateway: ShippingGateway.Ahamove,
    gatewayName: 'Ahamove'
  },
  {
    id: 'xanhsm-bike',
    label: { vi: 'Xanh SM xe máy', en: 'Xanh SM Bike' },
    description: {
      vi: 'Giao hoa bằng xe máy điện Xanh SM, cửa tới cửa.',
      en: 'Door-to-door flower delivery by Xanh SM electric motorbike.'
    },
    gateway: ShippingGateway.XanhSm,
    gatewayName: 'XanhSm'
  }
]

export const checkoutMethodsKey = (kind: CheckoutMethodKind): string =>
  kind === 'payment' ? CHECKOUT_PAYMENT_METHODS_KEY : CHECKOUT_DELIVERY_METHODS_KEY

export const matchesCheckoutMethodsKey = (key: string | null | undefined): boolean =>
  key === CHECKOUT_PAYMENT_METHODS_KEY || key === CHECKOUT_DELIVERY_METHODS_KEY

export const checkoutMethodKindFromKey = (key: string): CheckoutMethodKind | null => {
  if (key === CHECKOUT_PAYMENT_METHODS_KEY) return 'payment'
  if (key === CHECKOUT_DELIVERY_METHODS_KEY) return 'delivery'
  return null
}

export const checkoutMethodRegistry = (kind: CheckoutMethodKind) =>
  kind === 'payment' ? PAYMENT_METHOD_REGISTRY : DELIVERY_METHOD_REGISTRY

export const defaultCheckoutMethods = (kind: CheckoutMethodKind): CheckoutMethodsCollection => ({
  items: checkoutMethodRegistry(kind).map((item, index) => ({
    id: item.id,
    enabled: true,
    isDefault: index === 0,
    label: item.label,
    description: item.description,
    gateway: item.gateway,
    gatewayName: item.gatewayName
  }))
})

export const parseCheckoutMethods = (raw: unknown, kind: CheckoutMethodKind): CheckoutMethodsCollection => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return defaultCheckoutMethods(kind)
  }

  const rawItems = (parsed as { items?: unknown }).items
  if (!Array.isArray(rawItems)) {
    return defaultCheckoutMethods(kind)
  }

  const registry = checkoutMethodRegistry(kind)
  const definitions = new Map(registry.map((item) => [item.id, item]))
  const seen = new Set<string>()
  const items: CheckoutMethodItem[] = []

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) continue

    const item = rawItem as Partial<CheckoutMethodItem>
    if (typeof item.id !== 'string' || seen.has(item.id)) continue

    const definition = definitions.get(item.id)
    if (!definition) continue

    seen.add(item.id)
    items.push({
      id: item.id,
      enabled: item.enabled === true,
      isDefault: item.isDefault === true,
      label: parseLocalizedText(item.label ?? definition.label),
      description: parseLocalizedText(item.description ?? definition.description),
      // Gateways stay code-controlled - stored values are always re-derived from the registry.
      gateway: definition.gateway,
      gatewayName: definition.gatewayName
    })
  }

  // Newly supported methods appear in the editor but stay disabled until an admin opts in.
  for (const definition of registry) {
    if (seen.has(definition.id)) continue
    items.push({ ...definition, enabled: false, isDefault: false })
  }

  const enabled = items.filter((item) => item.enabled)
  const defaultId = enabled.find((item) => item.isDefault)?.id ?? enabled[0]?.id

  return { items: items.map((item) => ({ ...item, isDefault: item.id === defaultId })) }
}
