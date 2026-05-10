export const RevenueType = {
  Revenue: 'Revenue',
  Expense: 'Expense'
} as const

export type RevenueType = (typeof RevenueType)[keyof typeof RevenueType]

export const RevenueTypeLabel = {
  [RevenueType.Revenue]: 'project.addProjectRevenue.type.cashIn',
  [RevenueType.Expense]: 'project.addProjectRevenue.type.cashOut'
}

export type RevenueTypeLabel = (typeof RevenueTypeLabel)[keyof typeof RevenueTypeLabel]

export interface Revenue {
  id: string
  name: string
  amount: number
  balanceAfter: number
  type: RevenueType
  note: string
  createdOnUtc: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  labels: {
    id: string
    name: string
    color: string
  }[]
}
