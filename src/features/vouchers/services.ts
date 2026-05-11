import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetVoucherRedemptionsParams } from './hooks/use-get-voucher-redemptions'
import type { GetVouchersParams } from './hooks/use-get-vouchers'
import type {
  VoucherRedemptionRow,
  VoucherRow,
  VoucherScopeStats,
  VoucherStatusStats,
  VoucherTargetStats,
  VoucherTypeStats
} from './types'
import type { AddVoucherTargetsFormValues, CreateVoucherFormValues, UpdateVoucherFormValues } from './validations'

class VoucherService {
  private readonly baseUrl = 'vouchers'

  createVoucher = async ({ body }: { body: CreateVoucherFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getVouchers = async ({
    pageIndex,
    pageSize,
    searchTerm,
    isActive,
    discountType,
    scope,
    targetType,
    targetId,
    sortBy,
    startTime,
    endTime
  }: GetVouchersParams) => {
    const { data } = await api.get<BasePaginationResponse<VoucherRow>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        searchTerm,
        isActive,
        discountType,
        scope,
        targetType,
        targetId,
        sortBy,
        startTime,
        endTime
      }
    })

    return data
  }

  getVoucher = async ({ voucherId }: { voucherId?: string }) => {
    if (!voucherId) return null
    const { data } = await api.get<BaseResponse<VoucherRow>>(`/v1/${this.baseUrl}/${voucherId}`)

    return data.value
  }

  getVoucherRedemptions = async ({
    voucherId,
    pageIndex,
    pageSize,
    sortBy,
    searchTerm
  }: GetVoucherRedemptionsParams) => {
    if (!voucherId) return null
    const { data } = await api.get<BasePaginationResponse<VoucherRedemptionRow>>(
      `/v1/${this.baseUrl}/${voucherId}/redemptions`,
      { params: { pageIndex, pageSize, sortBy, searchTerm } }
    )

    return data
  }

  getVoucherByCode = async ({ voucherCode }: { voucherCode?: string }) => {
    if (!voucherCode) return null
    const { data } = await api.get<
      BaseResponse<
        Pick<VoucherRow, 'id' | 'code' | 'name' | 'discountType' | 'discountValue' | 'startsAtUtc' | 'endsAtUtc'> & {
          usedStatus: 'High' | 'Medium' | 'Low'
        }
      >
    >(`/v1/${this.baseUrl}/code/${voucherCode}`)

    return data.value
  }

  updateVoucherTargetStatus = async ({ body }: { body: { isActive: boolean; targetId: string } }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/targets/${body.targetId}/status`, {
      isActive: body.isActive
    })

    return data.value
  }

  updateVoucher = async ({ body }: { body: UpdateVoucherFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.voucherId}`, body)

    return data.value
  }

  deleteVoucher = async ({ voucherId }: { voucherId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${voucherId}`)

    return data.value
  }

  addVoucherTargets = async ({ body }: { body: AddVoucherTargetsFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.voucherId}/targets`,
      body.targets.map(({ targetId, targetType }) => ({ targetType, targetId }))
    )

    return data.value
  }

  deleteVoucherTarget = async ({ voucherId, targetId }: { voucherId: string; targetId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${voucherId}/targets/${targetId}`)

    return data.value
  }

  getVoucherScopeStats = async () => {
    const { data } = await api.get<BasePaginationResponse<VoucherScopeStats>>(`/v1/${this.baseUrl}/statistics/scope`)

    return data.value.items
  }

  getVoucherTypeStats = async () => {
    const { data } = await api.get<BasePaginationResponse<VoucherTypeStats>>(`/v1/${this.baseUrl}/statistics/type`)

    return data.value.items
  }

  getVoucherTargetStats = async () => {
    const { data } = await api.get<BasePaginationResponse<VoucherTargetStats>>(`/v1/${this.baseUrl}/statistics/targets`)

    return data.value.items
  }

  getVoucherStatusStats = async () => {
    const { data } = await api.get<BasePaginationResponse<VoucherStatusStats>>(`/v1/${this.baseUrl}/statistics/status`)

    return data.value.items
  }
}

const voucherService = new VoucherService()
export default voucherService
