import type { MentorTitle } from '../mentor-applications/types'

export const CommissionTargetModel = {
  MentorPackage: 'MentorPackage'
} as const

export type CommissionTargetModel = (typeof CommissionTargetModel)[keyof typeof CommissionTargetModel]

export const CommissionTargetModelLabel = {
  [CommissionTargetModel.MentorPackage]: 'commission.targetModel.mentorPackage'
} as const

export type CommissionTargetModelLabel = (typeof CommissionTargetModelLabel)[CommissionTargetModel]

export interface Commission {
  commissionId: string
  targetModel: CommissionTargetModel
  titleLevel: MentorTitle
  rate: number
  minAmount: number
  maxAmount: number
  createdBy: string
  createdOnUtc: string
  modifiedOnUtc: string | null
  isActive: boolean
}

export interface CommissionRow {
  titleLevel: MentorTitle
  commissions: Commission[]
}
