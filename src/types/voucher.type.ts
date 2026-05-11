import type { Currency } from '../features/transactions/types'

export const DiscountType = {
  Percentage: 'Percentage',
  FixedAmount: 'FixedAmount'
} as const

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]

export const DiscountTypeLabel: Record<DiscountType, string> = {
  [DiscountType.Percentage]: 'voucher.discountType.percent',
  [DiscountType.FixedAmount]: 'voucher.discountType.fixedAmount'
}

export type DiscountTypeLabel = (typeof DiscountTypeLabel)[keyof typeof DiscountTypeLabel]

export const Scope = {
  AllTargets: 'AllTargets',
  SpecificTargets: 'SpecificTargets'
} as const

export type Scope = (typeof Scope)[keyof typeof Scope]

export const ScopeLabel: Record<Scope, string> = {
  [Scope.AllTargets]: 'voucher.scope.allTargets',
  [Scope.SpecificTargets]: 'voucher.scope.specificTargets'
}

export type ScopeLabel = (typeof ScopeLabel)[keyof typeof ScopeLabel]

export const TargetType = {
  AllTargets: 'AllTargets',
  MentorPackage: 'MentorPackage',
  SubscriptionPlan: 'SubscriptionPlan'
} as const

export type TargetType = (typeof TargetType)[keyof typeof TargetType]

export const TargetTypeLabel: Record<TargetType, string> = {
  [TargetType.AllTargets]: 'voucher.targetType.allTargets',
  [TargetType.MentorPackage]: 'voucher.targetType.mentorPackage',
  [TargetType.SubscriptionPlan]: 'voucher.targetType.subscriptionPlan'
}

export type TargetTypeLabel = (typeof TargetTypeLabel)[keyof typeof TargetTypeLabel]

export interface VoucherRow {
  id: string
  code: string
  name: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  scope: Scope
  isActive: boolean
  startsAtUtc: string
  endsAtUtc: string
  totalUsageLimit: number
  usageLimitPerUser: number
  usedCount: number
  isStackable: boolean
  targets: VoucherTargetRow[]
  createdOnUtc: string
}

export interface VoucherTargetRow {
  id: string
  targetType: TargetType
  targetId: string
  isActive: boolean
  targetName: string
  targetDescription: string
  coverImageUrl: string | null
}

export interface VoucherScopeStats {
  scope: Scope
  totalVouchers: number
}

export interface VoucherTypeStats {
  type: DiscountType
  totalVouchers: number
}

export interface VoucherTargetStats {
  targetType: TargetType
  targetName: string
  totalVouchers: number
}

export interface VoucherStatusStats {
  status: string
  totalVouchers: number
}

export const VoucherRedemptionStatus = {
  Reserved: 'Reserved',
  Applied: 'Applied',
  Released: 'Released',
  Canceled: 'Canceled'
} as const

export type VoucherRedemptionStatus = (typeof VoucherRedemptionStatus)[keyof typeof VoucherRedemptionStatus]

export const VoucherRedemptionStatusLabel: Record<VoucherRedemptionStatus, string> = {
  [VoucherRedemptionStatus.Reserved]: 'voucher.redemptionStatus.reserved',
  [VoucherRedemptionStatus.Applied]: 'voucher.redemptionStatus.applied',
  [VoucherRedemptionStatus.Released]: 'voucher.redemptionStatus.released',
  [VoucherRedemptionStatus.Canceled]: 'voucher.redemptionStatus.canceled'
}

export type VoucherRedemptionStatusLabel =
  (typeof VoucherRedemptionStatusLabel)[keyof typeof VoucherRedemptionStatusLabel]

export interface VoucherRedemptionRow {
  redemptionId: string
  redeemedByUserId: string
  redeemedUserFirstName: string
  redeemedUserLastName: string
  redeemedUserEmail: string
  redeemedUserImageUrl: string | null
  appliedToType: TargetType
  appliedToId: string
  appliedToName: string
  appliedToDescription: string
  appliedToCoverImageUrl: string | null
  amountBeforeDiscount: number
  discountAmount: number
  amountAfterDiscount: number
  currency: Currency
  status: VoucherRedemptionStatus
  idempotencyKey: string
  createdOnUtc: string
}
