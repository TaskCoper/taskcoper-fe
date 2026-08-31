import type { BasePaginationResponse } from '@/lib/axios'

export interface FloralMockupListItem {
  id: string
  name: string
  description: string | null
  previewImageUrl: string | null
  isActive: boolean
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

export interface CreateFloralMockupPayload {
  name: string
  description: string | null
  imageFile: File
  isActive: true
}

export type FloralMockupsPage = BasePaginationResponse<FloralMockupListItem>['value']
