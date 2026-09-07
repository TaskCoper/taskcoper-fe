import type { BasePaginationResponse } from '@/lib/axios'

export interface FloralMockupListItem {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  isDelete: boolean
  createAt: string
  updateAt: string
}

export interface GetFloralMockupsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  isActive?: boolean
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
  imageFile: File
  isActive: true
}

export type FloralMockupsPage = BasePaginationResponse<FloralMockupListItem>['value']
