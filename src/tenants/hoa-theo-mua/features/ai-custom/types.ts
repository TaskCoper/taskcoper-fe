import type { BasePaginationResponse } from '@/lib/axios'

export const AiCardWritingMode = {
  Calligraphy: 'Calligraphy',
  Printed: 'Printed'
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
  userId: string | null
  createdAt: string
  cardType: string
  formType: AiCardWritingMode
  sizeKey: string | null
  senderName: string | null
  receiverName: string | null
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
  orderId: string
  status: string | null
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
  sizeKey?: string
  formType?: AiCardWritingMode
}

export type AiCardHistoryPage = BasePaginationResponse<GeneratedCardHistoryItem>['value']

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
