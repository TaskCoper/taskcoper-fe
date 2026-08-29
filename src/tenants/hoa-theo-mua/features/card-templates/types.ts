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

export interface CreateCardTemplatePayload {
  name: string
  description: string | null
  imageFile: File
  isActive: boolean
}

export interface UpdateCardTemplatePayload {
  id: string
  name: string
  description: string | null
  imageFile: File | null
}

export type CardTemplatesPage = BasePaginationResponse<CardTemplateListItem>['value']
