import type { TenantT } from '@/lib/i18n/use-tenant-translation'

export const NhanhOrderStatus = {
  Packed: 40,
  Packing: 42,
  AwaitingPickup: 43,
  New: 54,
  Confirming: 55,
  Confirmed: 56,
  AwaitingCustomerConfirmation: 57,
  CarrierCancelled: 58,
  Shipping: 59,
  Success: 60,
  Failed: 61,
  CustomerCancelled: 63,
  SystemCancelled: 64,
  OutOfStock: 68,
  Returning: 71,
  Returned: 72,
  ChangingWarehouse: 73,
  ReturnConfirmed: 74
} as const

export type NhanhOrderStatus = (typeof NhanhOrderStatus)[keyof typeof NhanhOrderStatus]
export type NhanhOrderStatusValue = NhanhOrderStatus | number | string | null

const NhanhOrderStatusLabel = {
  [NhanhOrderStatus.Packed]: 'orders.nhanhStatus.packed',
  [NhanhOrderStatus.Packing]: 'orders.nhanhStatus.packing',
  [NhanhOrderStatus.AwaitingPickup]: 'orders.nhanhStatus.awaitingPickup',
  [NhanhOrderStatus.New]: 'orders.nhanhStatus.new',
  [NhanhOrderStatus.Confirming]: 'orders.nhanhStatus.confirming',
  [NhanhOrderStatus.Confirmed]: 'orders.nhanhStatus.confirmed',
  [NhanhOrderStatus.AwaitingCustomerConfirmation]: 'orders.nhanhStatus.awaitingCustomerConfirmation',
  [NhanhOrderStatus.CarrierCancelled]: 'orders.nhanhStatus.carrierCancelled',
  [NhanhOrderStatus.Shipping]: 'orders.nhanhStatus.shipping',
  [NhanhOrderStatus.Success]: 'orders.nhanhStatus.success',
  [NhanhOrderStatus.Failed]: 'orders.nhanhStatus.failed',
  [NhanhOrderStatus.CustomerCancelled]: 'orders.nhanhStatus.customerCancelled',
  [NhanhOrderStatus.SystemCancelled]: 'orders.nhanhStatus.systemCancelled',
  [NhanhOrderStatus.OutOfStock]: 'orders.nhanhStatus.outOfStock',
  [NhanhOrderStatus.Returning]: 'orders.nhanhStatus.returning',
  [NhanhOrderStatus.Returned]: 'orders.nhanhStatus.returned',
  [NhanhOrderStatus.ChangingWarehouse]: 'orders.nhanhStatus.changingWarehouse',
  [NhanhOrderStatus.ReturnConfirmed]: 'orders.nhanhStatus.returnConfirmed'
} satisfies Record<NhanhOrderStatus, string>

type NhanhOrderStatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const NhanhOrderStatusTone: Record<NhanhOrderStatus, NhanhOrderStatusTone> = {
  [NhanhOrderStatus.Packed]: 'info',
  [NhanhOrderStatus.Packing]: 'info',
  [NhanhOrderStatus.AwaitingPickup]: 'info',
  [NhanhOrderStatus.New]: 'info',
  [NhanhOrderStatus.Confirming]: 'info',
  [NhanhOrderStatus.Confirmed]: 'info',
  [NhanhOrderStatus.AwaitingCustomerConfirmation]: 'info',
  [NhanhOrderStatus.CarrierCancelled]: 'danger',
  [NhanhOrderStatus.Shipping]: 'info',
  [NhanhOrderStatus.Success]: 'success',
  [NhanhOrderStatus.Failed]: 'danger',
  [NhanhOrderStatus.CustomerCancelled]: 'danger',
  [NhanhOrderStatus.SystemCancelled]: 'danger',
  [NhanhOrderStatus.OutOfStock]: 'warning',
  [NhanhOrderStatus.Returning]: 'warning',
  [NhanhOrderStatus.Returned]: 'neutral',
  [NhanhOrderStatus.ChangingWarehouse]: 'info',
  [NhanhOrderStatus.ReturnConfirmed]: 'info'
}

const toneStyles: Record<NhanhOrderStatusTone, { badge: string; dot: string }> = {
  success: {
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  danger: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400',
    dot: 'bg-rose-500'
  },
  warning: {
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  info: {
    badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400',
    dot: 'bg-blue-500'
  },
  neutral: {
    badge: 'border-muted-foreground/20 bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/50'
  }
}

const normalizeLegacyStatus = (status: string) =>
  status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const isLegacySuccessStatus = (status: string) => {
  const normalizedStatus = normalizeLegacyStatus(status)
  return ['thanh cong', 'hoan thanh', 'da thanh toan', 'success', 'complete', 'paid'].some((value) =>
    normalizedStatus.includes(value)
  )
}

const isNhanhOrderStatus = (status: number): status is NhanhOrderStatus => status in NhanhOrderStatusLabel

export const resolveNhanhOrderStatus = (value: NhanhOrderStatusValue, t: TenantT) => {
  if (value == null) return null

  const rawValue = String(value).trim()
  if (!rawValue) return null

  const numericValue = Number(rawValue)
  const isNumericValue = /^-?\d+$/.test(rawValue) && Number.isSafeInteger(numericValue)

  if (isNumericValue && isNhanhOrderStatus(numericValue)) {
    const tone = NhanhOrderStatusTone[numericValue]
    return {
      code: numericValue,
      label: t(NhanhOrderStatusLabel[numericValue]),
      isSuccess: numericValue === NhanhOrderStatus.Success,
      ...toneStyles[tone]
    }
  }

  const tone = isLegacySuccessStatus(rawValue) ? 'success' : 'neutral'
  return {
    code: null,
    label: isNumericValue ? t('orders.nhanhStatus.unknown', { status: rawValue }) : rawValue,
    isSuccess: tone === 'success',
    ...toneStyles[tone]
  }
}
