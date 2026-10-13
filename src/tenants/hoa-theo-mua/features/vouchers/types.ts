import type { BasePaginationResponse } from '@/lib/axios'

export type VoucherVisibility = 'public' | 'private'
export type VoucherDiscountType = 'cash' | 'percent'

export interface Voucher {
  id: string
  code: string
  description: string | null
  visibility: VoucherVisibility
  isActive: boolean
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  maxUsageCount: number
  usedCount: number
  startAt: string
  endAt: string | null
  minOrderAmount: number | null
  maxOrderAmount: number | null
  createdAt: string
  updatedAt: string | null
  isDeleted?: boolean
}

export interface VoucherProgram {
  id: string
  name: string
  isActive: boolean
  startAt: string
  endAt: string | null
  minOrderAmount: number | null
  maxOrderAmount: number | null
  voucherCount: number
  usedVoucherCount: number
  createdAt: string
  updatedAt: string | null
  isDeleted?: boolean
}

export interface ProgramVoucherItem {
  id: string
  code: string
  description: string | null
  isActive: boolean
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  maxUsageCount: number
  usedCount: number
  createdAt: string
  updatedAt: string | null
}

export interface VoucherUsage {
  orderId: string
  userId: string
  customerName: string
  customerPhone: string
  discountAmount: number
  usedAt: string | null
}

export interface PageParams {
  pageIndex?: number
  pageSize?: number
}

export interface GetVouchersParams extends PageParams {
  keyword?: string
  visibility?: VoucherVisibility
  isActive?: boolean
}

export interface GetProgramsParams extends PageParams {
  keyword?: string
  isActive?: boolean
  isDelete?: boolean
}

export interface GetProgramCodesParams extends PageParams {
  keyword?: string
  isActive?: boolean
}

export interface CreateVoucherPayload {
  code?: string
  codePrefix?: string
  codeLength?: number
  codeSuffix?: string
  description?: string
  visibility: VoucherVisibility
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  maxUsageCount: number
  startAt: string
  endAt: string | null
  minOrderAmount?: number | null
  maxOrderAmount?: number | null
}

export interface UpdateVoucherItem extends Partial<
  Omit<CreateVoucherPayload, 'code' | 'codePrefix' | 'codeLength' | 'codeSuffix'>
> {
  id: string
}

export interface CreateProgramPayload {
  name: string
  startAt: string
  endAt: string | null
  minOrderAmount: number | null
  maxOrderAmount: number | null
}

export interface UpdateProgramPayload extends CreateProgramPayload {
  id: string
  isActive?: boolean
}

export interface GenerateVouchersPayload {
  codePrefix?: string
  codeLength: number
  codeSuffix?: string
  quantity: number
  maxUsageCount: number
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  description?: string
}

export interface GenerateVouchersResult {
  programId: string
  createdCount: number
  isActive: boolean
  codes: string[]
}

export interface VoucherExportFile {
  blob: Blob
  fileName: string
}

export type VoucherPage = BasePaginationResponse<Voucher>['value']
export type VoucherProgramPage = BasePaginationResponse<VoucherProgram>['value']
export type ProgramVoucherPage = BasePaginationResponse<ProgramVoucherItem>['value']
export type VoucherUsagePage = BasePaginationResponse<VoucherUsage>['value']
