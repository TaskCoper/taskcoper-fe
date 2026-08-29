import type { BasePaginationResponse } from '@/lib/axios'

export interface CardTemplateListItem {
  id: string
  name: string
  previewImageUrl: string | null
  description: string | null
  isActive: boolean
}

export interface GetCardTemplatesParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export type CardTemplatesPage = BasePaginationResponse<CardTemplateListItem>['value']
