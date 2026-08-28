import type { BasePaginationResponse } from '@/lib/axios'

export const AiCardWritingMode = {
  Calligraphy: 'calligraphy',
  Typed: 'typed'
} as const

export type AiCardWritingMode = (typeof AiCardWritingMode)[keyof typeof AiCardWritingMode]

export interface AiCardHistoryItem {
  id: string
  code: string
  outputImageUrl: string | null
  customerId: string | null
  customerName: string | null
  customerPhone: string | null
  templateId: string | null
  templateName: string | null
  sizeId: string | null
  sizeName: string | null
  writingMode: AiCardWritingMode
  createdAt: string
}

export interface GetAiCardHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  sizeId?: string
  writingMode?: AiCardWritingMode
}

export type AiCardHistoryPage = BasePaginationResponse<AiCardHistoryItem>['value']
