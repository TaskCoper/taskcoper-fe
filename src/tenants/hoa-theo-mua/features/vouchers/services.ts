import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type {
  CreateProgramPayload,
  CreateVoucherPayload,
  GenerateVouchersPayload,
  GetProgramsParams,
  GetVouchersParams,
  PageParams,
  UpdateProgramPayload,
  UpdateVoucherItem,
  Voucher,
  VoucherPage,
  VoucherProgram,
  VoucherProgramDetail,
  VoucherProgramPage,
  VoucherExportFile,
  VoucherUsage,
  VoucherUsagePage
} from './types'

class VoucherService extends BaseService {
  getVouchers = async (params: GetVouchersParams): Promise<VoucherPage> => {
    const { data } = await this.get<BasePaginationResponse<Voucher>>('/v1/admin/vouchers', { params })
    return data.value
  }

  getPrograms = async (params: GetProgramsParams): Promise<VoucherProgramPage> => {
    const { data } = await this.get<BasePaginationResponse<VoucherProgram>>('/v1/admin/voucher-programs', { params })
    return data.value
  }

  getProgram = async (programId: string): Promise<VoucherProgramDetail | null> => {
    const { data } = await this.get<BasePaginationResponse<VoucherProgramDetail>>(
      '/v1/admin/voucher-programs/with-vouchers',
      { params: { programId, pageIndex: 1, pageSize: 1 } }
    )
    return data.value.items[0] ?? null
  }

  createVoucher = async (payload: CreateVoucherPayload) => {
    const { data } = await this.post<BaseResponse<string>>('/v1/admin/vouchers', payload)
    return data.value
  }

  updateVouchers = async (items: UpdateVoucherItem[]) => {
    const { data } = await this.put<BaseResponse<string>>('/v1/admin/vouchers', { items })
    return data.value
  }

  setVouchersActive = async (ids: string[], isActive: boolean) => {
    const { data } = await this.patch<BaseResponse<string>>('/v1/admin/vouchers/active', { ids, isActive })
    return data.value
  }

  deleteVoucher = async (voucherId: string) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/admin/vouchers/${voucherId}`)
    return data.value
  }

  createProgram = async (payload: CreateProgramPayload) => {
    const { data } = await this.post<BaseResponse<string>>('/v1/admin/voucher-programs', payload)
    return data.value
  }

  updateProgram = async ({ id: programId, ...payload }: UpdateProgramPayload) => {
    const { data } = await this.put<BaseResponse<VoucherProgram>>(`/v1/admin/voucher-programs/${programId}`, payload)
    return data.value
  }

  deleteProgram = async (programId: string) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/admin/voucher-programs/${programId}`)
    return data.value
  }

  generateVouchers = async (programId: string, payload: GenerateVouchersPayload) => {
    const { data } = await this.post<BaseResponse<{ programId: string; createdCount: number; codes: string[] }>>(
      `/v1/admin/voucher-programs/${programId}/vouchers`,
      payload
    )
    return data.value
  }

  getUsages = async (voucherId: string, params: PageParams): Promise<VoucherUsagePage> => {
    const { data } = await this.get<BasePaginationResponse<VoucherUsage>>(`/v1/admin/vouchers/${voucherId}/usages`, {
      params
    })
    return data.value
  }

  exportVouchers = async (params: { visibility?: string; programIds?: string[] }) => {
    const response = await this.get<Blob>('/v1/admin/vouchers/export', { params, responseType: 'blob' })
    const contentDisposition = response.headers['content-disposition'] as string | undefined
    const fileName = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)?.[1]
    return {
      blob: response.data,
      fileName: fileName ? decodeURIComponent(fileName) : 'vouchers.xlsx'
    } satisfies VoucherExportFile
  }
}

export default new VoucherService()
