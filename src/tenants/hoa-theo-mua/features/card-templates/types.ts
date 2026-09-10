import type { BasePaginationResponse } from '@/lib/axios'

export const CardTemplateType = {
  Handmade: 'handmade',
  Ai: 'ai'
} as const

export type CardTemplateType = (typeof CardTemplateType)[keyof typeof CardTemplateType]

export const isCardTemplateType = (value: unknown): value is CardTemplateType =>
  Object.values(CardTemplateType).includes(value as CardTemplateType)

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
  imageUrl: string
  templateType: CardTemplateType
}

export interface UpdateCardTemplatePayload {
  id: string
  name?: string
  description?: string | null
  imageUrl?: string
  isActive?: boolean
}

export interface ChangeCardTemplateStatusPayload {
  id: string
  isActive: boolean
}

export type CardTemplatesPage = BasePaginationResponse<CardTemplateListItem>['value']
