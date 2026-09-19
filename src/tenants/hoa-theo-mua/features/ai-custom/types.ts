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
  id: string
  name: string
  userId: string
  imageUrl: string | null
  createdAt: string
  metadata: GeneratedFlowerMetadata | null
  clientHistory: GeneratedFlowerClientHistory | null
}

export interface GeneratedFlowerMaterial {
  matId: string
  name: string
  quantity: number
  isCore: boolean
}

export interface GeneratedFlowerProductSnapshot {
  name: string | null
  attributes: Record<string, unknown>
  image: GeneratedFlowerImageSnapshot | null
  observedStatus: GeneratedFlowerObservedStatus | null
}

export interface GeneratedFlowerBundleSnapshot {
  id: string
  name: string
  description: string | null
  image: GeneratedFlowerImageSnapshot | null
  observedStatus: GeneratedFlowerObservedStatus | null
}

export interface GeneratedFlowerMockupSnapshot {
  id: string
  name: string
  description: string | null
  image: GeneratedFlowerImageSnapshot | null
  observedStatus: GeneratedFlowerObservedStatus | null
}

export interface GeneratedFlowerImageSnapshot {
  url: string | null
  objectKey?: string | null
  versionId?: string | null
  sha256?: string | null
}

export interface GeneratedFlowerObservedStatus {
  isActive: boolean
  isDeleted: boolean
}

export interface GeneratedFlowerMetadata {
  subId: string | null
  aiCustomize: boolean
  ribbon: GeneratedFlowerMaterialAccessory | null
  wrappingPaper: GeneratedFlowerMaterialAccessory | null
  AdditionCustome?: GeneratedFlowerMaterial[] | null
  materials: GeneratedFlowerMaterial[]
}

export interface GeneratedFlowerMaterialAccessory {
  id: string
  name: string
  label: string
  imageUrl: string | null
  isActive: boolean
  isDeleted: boolean
}

export interface GeneratedFlowerClientHistoryMetadata {
  schemaVersion: number | null
  operation: string | null
  product: GeneratedFlowerProductSnapshot | null
  bundle: GeneratedFlowerBundleSnapshot | null
  mockup: GeneratedFlowerMockupSnapshot | null
  logoConfig: Record<string, unknown>
  regeneratedFromFlowerId: string | null
  systemPromptSource: string | null
  validatedAt: string | null
}

export interface GeneratedFlowerClientHistory {
  id: string
  userId: string
  type: string
  systemForm: { type: string; content: string } | null
  metadata: GeneratedFlowerClientHistoryMetadata | null
  rootId: string | null
  createdAt: string
  baseId: string | null
  outputId: string | null
  sesionId: string | null
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

export type GeneratedFlowerDetail = GeneratedFlowerHistoryItem

export interface GetAiFlowerDesignHistoryParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  comboIds?: string[]
}

export type AiFlowerDesignHistoryPage = BasePaginationResponse<GeneratedFlowerHistoryItem>['value']
