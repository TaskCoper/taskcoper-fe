export type Currency = 'Vnd' | 'Usd'

export const TransactionStatus = {
  Pending: 'Pending',
  Completed: 'Completed',
  Failed: 'Failed',
  Canceled: 'Canceled',
  Refunded: 'Refunded'
} as const

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus]

export const TransactionStatusLabel = {
  [TransactionStatus.Pending]: 'transactions.status.pending',
  [TransactionStatus.Completed]: 'transactions.status.completed',
  [TransactionStatus.Failed]: 'transactions.status.failed',
  [TransactionStatus.Canceled]: 'transactions.status.canceled',
  [TransactionStatus.Refunded]: 'transactions.status.refunded'
}

export type TransactionStatusLabel = (typeof TransactionStatusLabel)[keyof typeof TransactionStatusLabel]

export const TransactionType = {
  Payment: 'Payment',
  Refund: 'Refund'
} as const

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export const TransactionTypeLabel = {
  [TransactionType.Payment]: 'transactions.type.payment',
  [TransactionType.Refund]: 'transactions.type.refund'
} as const

export type TransactionTypeLabel = (typeof TransactionTypeLabel)[keyof typeof TransactionTypeLabel]

export const TransactionTargetModel = {
  Subscription: 'Subscription',
  PackageBooking: 'PackageBooking'
} as const

export type TransactionTargetModel = (typeof TransactionTargetModel)[keyof typeof TransactionTargetModel]

export const TransactionTargetModelLabel = {
  [TransactionTargetModel.Subscription]: 'transactions.targetModel.subscription',
  [TransactionTargetModel.PackageBooking]: 'transactions.targetModel.packageBooking'
} as const

export type TransactionTargetModelLabel = (typeof TransactionTargetModelLabel)[keyof typeof TransactionTargetModelLabel]

export interface Transaction {
  transactionId: string
  targetModel: TransactionTargetModel
  targetModelId: string
  type: TransactionType
  amount: number
  currency: Currency
  status: TransactionStatus
  description: string
  gatewayName: string
  qrCodePaymentUrl: string
  identifyDescription: string
  externalTransactionId: string | null
  paidAt: string | null
  failureReason: string | null
  createdOnUtc: string
}

export interface TransactionRow {
  transactionId: string
  targetModel: string
  type: TransactionType
  amount: number
  currency: Currency
  status: TransactionStatus
  description: string
  gatewayName: string
  paidAt: string
  createdOnUtc: string
}

export interface TransactionTypeStats {
  type: TransactionType
  totalTransactions: number
}

export interface TransactionStatusStats {
  status: TransactionStatus
  totalTransactions: number
}
