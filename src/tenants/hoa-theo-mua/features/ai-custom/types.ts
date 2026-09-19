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

export interface GeneratedCardTemplateReference {
  id: string
  name: string
  templateType: string
  imageUrl: string | null
}

export interface GeneratedCardSourceReference {
  type: string
  id: string
  imageUrl: string | null
}

export interface GeneratedCardClientHistoryMetadata {
  operation: string | null
  orderDetailId: string | null
  virtualId: string | null
  sourceType: string | null
  originProductId: string | null
  generatedFlowerId: string | null
  source: GeneratedCardSourceReference | null
  cardTemplate: GeneratedCardTemplateReference | null
  regeneratedFromCardId: string | null
  systemPromptSource: string | null
  validatedAt: string | null
}

export interface GeneratedCardClientHistory {
  id: string
  userId: string
  type: string
  systemForm: { type: string; content: string } | null
  metadata: GeneratedCardClientHistoryMetadata | null
  rootId: string | null
  createdAt: string
  baseId: string | null
  outputId: string | null
  sesionId: string | null
}

export interface AiCardLinkedOrder {
  id: string
  code: string
  status: string | null
  createdAt: string
}

export interface GeneratedCardHistoryItem {
  historyId: string
  clientHistory?: GeneratedCardClientHistory | null
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
  cardTemplateName?: string | null
  templateName?: string | null
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
  id?: string
  pageIndex?: number
  pageSize?: number
  size?: string
  cardTemplateName?: string
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
