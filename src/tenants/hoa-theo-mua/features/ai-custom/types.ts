import type { BasePaginationResponse } from '@/lib/axios'

export const AiCardWritingMode = {
  Calligraphy: 'calligraphy',
  Typed: 'typed'
} as const

export type AiCardWritingMode = (typeof AiCardWritingMode)[keyof typeof AiCardWritingMode]

export const AiCardFileStatus = {
  Available: 'available',
  Processing: 'processing',
  Expired: 'expired'
} as const

export type AiCardFileStatus = (typeof AiCardFileStatus)[keyof typeof AiCardFileStatus]

export interface AiCardLinkedOrder {
  id: string
  code: string
  status: string | null
  createdAt: string
}

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

export interface AiCardDetail extends AiCardHistoryItem {
  customerEmail: string | null
  senderName: string | null
  recipientName: string | null
  greetingMessage: string | null
  attachmentImageUrls: string[]
  fileStatus: AiCardFileStatus
  linkedOrders: AiCardLinkedOrder[]
}

export interface GetAiCardHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  sizeId?: string
  writingMode?: AiCardWritingMode
}

export type AiCardHistoryPage = BasePaginationResponse<AiCardHistoryItem>['value']

export interface AiFlowerDesignHistoryItem {
  id: string
  code: string
  outputImageUrl: string | null
  customerId: string | null
  customerName: string | null
  customerPhone: string | null
  orderCode: string | null
  sourceComboId: string
  sourceComboCode: string | null
  sourceComboName: string | null
  createdAt: string
}

export interface AiFlowerDesignComboOption {
  id: string
  code: string | null
  name: string
  imageUrl: string | null
}

export interface GetAiFlowerDesignComboOptionsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export type AiFlowerDesignComboOptionsPage = BasePaginationResponse<AiFlowerDesignComboOption>['value']

export interface AiFlowerDesignMaterialSnapshot {
  id: string
  code: string | null
  name: string
  imageUrl: string | null
  unit: string | null
  quantity: number
}

export interface AiFlowerDesignSourceCombo {
  id: string
  code: string | null
  name: string
  description: string | null
  imageUrl: string | null
}

export interface AiFlowerDesignSourceMockup {
  id: string
  code: string | null
  name: string
  imageUrl: string | null
}

export interface AiFlowerDesignDetail extends AiFlowerDesignHistoryItem {
  customerEmail: string | null
  sourceCombo: AiFlowerDesignSourceCombo
  coreMaterials: AiFlowerDesignMaterialSnapshot[]
  supportMaterials: AiFlowerDesignMaterialSnapshot[]
  sourceMockup: AiFlowerDesignSourceMockup | null
  customRequest: string | null
  fileStatus: AiCardFileStatus
  linkedOrders: AiCardLinkedOrder[]
}

export interface GetAiFlowerDesignHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  comboIds?: string[]
}

export type AiFlowerDesignHistoryPage = BasePaginationResponse<AiFlowerDesignHistoryItem>['value']
