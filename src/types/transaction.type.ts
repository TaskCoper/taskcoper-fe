export interface Transaction {
  transactionId: string
  targetModel: string
  targetModelId: string
  type: string
  amount: number
  currency: string
  status: string
  description: string
  gatewayName: string
  qrCodePaymentUrl: string
  identifyDescription: string
  externalTransactionId: string | null
  paidAt: string | null
  failureReason: string | null
  createdOnUtc: string
}
