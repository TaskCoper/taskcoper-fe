import type { BasePaginationResponse } from '@/lib/axios'

export const FlowerReferenceType = {
  Flower: 'flower',
  Bundle: 'bundle'
} as const

export type FlowerReferenceType = (typeof FlowerReferenceType)[keyof typeof FlowerReferenceType]

export interface FloralMockupListItem {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  type: FlowerReferenceType
}

export interface GetFloralMockupsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  type?: FlowerReferenceType
}

export interface ChangeFloralMockupStatusPayload {
  id: string
  isActive: boolean
}

export interface DeleteFloralMockupPayload {
  id: string
}

export interface CreateFloralMockupPayload {
  name: string
  description: string | null
  imageUrl: string
  type: FlowerReferenceType
  isActive: boolean
}

export type FloralMockupsPage = BasePaginationResponse<FloralMockupListItem>['value']
