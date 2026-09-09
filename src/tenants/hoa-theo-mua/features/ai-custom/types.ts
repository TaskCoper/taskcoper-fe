import type { BasePaginationResponse } from '@/lib/axios'

export const AiCardWritingMode = {
  Calligraphy: 'Calligraphy',
  GoMay: 'GoMay'
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

export interface GeneratedCardHistoryItem {
  historyId: string
  generatedCardId: string
  content: string
  imageUrl: string | null
  rawImage: string | null
  createdAt: string
  cardType: string
  formType: AiCardWritingMode
  senderName: string | null
  receiverName: string | null
  nameCustomer: string | null
  phoneCustomer: string | null
  addressCustomer: string | null
  messageContent: string | null
  attachedImageUrl: string | null
  sizeName: string | null
  sizeWidth: number | null
  sizeHeight: number | null
  sizeBasePrice: number | null
  sizeMaxWords: number | null
  wordCount: number
  wordConfigSnapshot: unknown
  basePrice: number
  extraPrice: number
  totalPrice: number
  templateName: string | null
}

export interface GeneratedCardOrder {
  id: string
  status: string | null
  createdAt: string
  totalFee: number
}

export interface GeneratedCardDetailItem extends GeneratedCardHistoryItem {
  orders: GeneratedCardOrder[]
}

export interface GeneratedCardDownload {
  generatedCardId: string
  imageUrl: string
  fileName: string
  contentType: string
}

export interface GetAiCardHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  sizeName?: string
  formType?: AiCardWritingMode
}

export type AiCardHistoryPage = BasePaginationResponse<GeneratedCardHistoryItem>['value']

export interface GeneratedFlowerHistoryItem {
  historyId: string
  generatedFlowerId: string
  nameCustomer: string | null
  phoneCustomer: string | null
  addressCustomer: string | null
  comboId: string
  comboName: string | null
  productCode: string | null
  imageUrl: string | null
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

export interface GeneratedFlowerMaterial {
  code: string | null
  name: string
  unit: string | null
  quantity: number
  isCore: boolean
}

export interface GeneratedFlowerSourceCombo {
  code: string | null
  name: string
  description: string | null
  imageCombo: string | null
}

export interface GeneratedFlowerMockup {
  name: string
  imageUrl: string | null
}

export interface GeneratedFlowerOrder {
  id: string
  status: string | null
  createdAt: string
  totalFee: number
}

export interface GeneratedFlowerDetail {
  historyId: string
  generatedFlowerId: string
  nameCustomer: string | null
  phoneCustomer: string | null
  addressCustomer: string | null
  sourceCombo: GeneratedFlowerSourceCombo
  imageUrl: string | null
  mockup: GeneratedFlowerMockup | null
  materials: GeneratedFlowerMaterial[]
  createdAt: string
  orders: GeneratedFlowerOrder[]
}

export interface GetAiFlowerDesignHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  comboIds?: string[]
}

export type AiFlowerDesignHistoryPage = BasePaginationResponse<GeneratedFlowerHistoryItem>['value']
