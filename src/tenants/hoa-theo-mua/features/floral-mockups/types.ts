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
}

export interface ChangeFloralMockupStatusPayload {
  id: string
  isActive: boolean
}

export type FloralMockupsPage = BasePaginationResponse<FloralMockupListItem>['value']
