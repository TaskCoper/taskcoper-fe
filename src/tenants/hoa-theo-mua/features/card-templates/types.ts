import type { BasePaginationResponse } from '@/lib/axios'

export type CardTemplateType = 'readyMade' | 'ai'
export interface CardTemplateListItem {
  id: string
  name: string
  imageUrl: string | null
  description: string | null
  isActive: boolean
  templateType: CardTemplateType
  createdAt: string
  updatedAt: string
}

export interface GetCardTemplatesParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  templateType?: CardTemplateType
}

export interface CreateCardTemplatePayload {
  name: string
  description: string | null
  imageFile: File
  isActive: boolean
  templateType: CardTemplateType
}

export interface UpdateCardTemplatePayload {
  id: string
  name?: string
  description?: string | null
  imageFile?: File | null
  isActive?: boolean
}

export interface ChangeCardTemplateStatusPayload {
  id: string
  isActive: boolean
}

export type CardTemplatesPage = BasePaginationResponse<CardTemplateListItem>['value']
