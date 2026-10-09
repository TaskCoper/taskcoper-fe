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
  VoucherProgramPage,
  VoucherExportFile,
  VoucherUsage,
  VoucherUsagePage
} from './types'

// BE voucher API chưa deploy. Đổi thành false khi API sẵn sàng để dùng các endpoint bên dưới.
const USE_MOCK_VOUCHER_API = true

const now = new Date().toISOString()
const mockPrograms: VoucherProgram[] = [
  {
    id: 'program-20-10',
    name: 'Chương trình 20/10',
    isActive: true,
    startAt: '2026-10-01T00:00:00+07:00',
    endAt: '2026-10-31T23:59:59+07:00',
    minOrderAmount: 200000,
    maxOrderAmount: null,
    voucherCount: 2,
    usedVoucherCount: 1,
    createdAt: now,
    updatedAt: null
  }
]

const mockVouchers: Voucher[] = [
  {
    id: 'voucher-sale-50k',
    programId: null,
    programName: null,
    code: 'SALE50K',
    description: 'Giảm 50.000đ cho đơn từ 300.000đ',
    visibility: 'public',
    isActive: true,
    discountType: 'cash',
    discountValue: 50000,
    maxDiscountAmount: null,
    maxUsageCount: 500,
    usedCount: 12,
    startAt: '2026-10-01T00:00:00+07:00',
    endAt: '2026-11-30T23:59:59+07:00',
    minOrderAmount: 300000,
    maxOrderAmount: null,
    createdAt: now,
    updatedAt: null
  },
  {
    id: 'voucher-20-10-001',
    programId: 'program-20-10',
    programName: 'Chương trình 20/10',
    code: 'HTMK7Q2M4X',
    description: 'Quà tặng ngày Phụ nữ Việt Nam',
    visibility: 'private',
    isActive: true,
    discountType: 'percent',
    discountValue: 20,
    maxDiscountAmount: 100000,
    maxUsageCount: 1,
    usedCount: 1,
    startAt: '2026-10-01T00:00:00+07:00',
    endAt: '2026-10-31T23:59:59+07:00',
    minOrderAmount: 200000,
    maxOrderAmount: null,
    createdAt: now,
    updatedAt: null
  }
]

const mockUsages: Record<string, VoucherUsage[]> = {
  'voucher-sale-50k': [
    {
      orderId: 'order-demo-001',
      userId: 'user-demo-001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0912345678',
      discountAmount: 50000,
      usedAt: now
    }
  ]
}

const pageOf = <T>(items: T[], pageIndex = 1, pageSize = 20) => ({
  items: items.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
  pageIndex,
  pageSize,
  totalCount: items.length,
  hasNextPage: pageIndex * pageSize < items.length,
  hasPreviousPage: pageIndex > 1
})

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

class VoucherService extends BaseService {
  getVouchers = async (params: GetVouchersParams): Promise<VoucherPage> => {
    if (USE_MOCK_VOUCHER_API) {
      const items = mockVouchers.filter((voucher) => {
        const keyword = params.keyword?.toLowerCase()
        return (
          !voucher.isDeleted &&
          (!keyword ||
            voucher.code.toLowerCase().includes(keyword) ||
            voucher.description?.toLowerCase().includes(keyword)) &&
          (!params.visibility || voucher.visibility === params.visibility) &&
          (params.isActive === undefined || voucher.isActive === params.isActive) &&
          (params.programId ? voucher.programId === params.programId : voucher.programId === null)
        )
      })
      return pageOf(items, params.pageIndex, params.pageSize)
    }
    const { data } = await this.get<BasePaginationResponse<Voucher>>('/v1/admin/vouchers', { params })
    return data.value
  }

  getPrograms = async (params: GetProgramsParams): Promise<VoucherProgramPage> => {
    if (USE_MOCK_VOUCHER_API) {
      const keyword = params.keyword?.toLowerCase()
      return pageOf(
        mockPrograms.filter(
          (program) =>
            !program.isDeleted &&
            (!keyword || program.name.toLowerCase().includes(keyword)) &&
            (params.isActive === undefined || program.isActive === params.isActive)
        ),
        params.pageIndex,
        params.pageSize
      )
    }
    const { data } = await this.get<BasePaginationResponse<VoucherProgram>>('/v1/admin/voucher-programs', { params })
    return data.value
  }

  getProgram = async (programId: string) => {
    if (USE_MOCK_VOUCHER_API)
      return mockPrograms.find((program) => program.id === programId && !program.isDeleted) ?? null

    const { data } = await this.get<BaseResponse<VoucherProgram>>(`/v1/admin/voucher-programs/${programId}`)
    return data.value
  }

  createVoucher = async (payload: CreateVoucherPayload) => {
    if (USE_MOCK_VOUCHER_API) {
      const voucher: Voucher = {
        id: id('voucher'),
        programId: null,
        programName: null,
        code: payload.code ?? `${payload.codePrefix ?? 'HTM'}${id('CODE').slice(-payload.codeLength!).toUpperCase()}`,
        description: payload.description ?? null,
        visibility: payload.visibility,
        isActive: false,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        maxDiscountAmount: payload.maxDiscountAmount ?? null,
        maxUsageCount: payload.maxUsageCount,
        usedCount: 0,
        startAt: payload.startAt,
        endAt: payload.endAt,
        minOrderAmount: payload.minOrderAmount ?? null,
        maxOrderAmount: payload.maxOrderAmount ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: null
      }
      mockVouchers.unshift(voucher)
      return 'Create voucher successfully'
    }
    const { data } = await this.post<BaseResponse<string>>('/v1/admin/vouchers', payload)
    return data.value
  }

  updateVouchers = async (items: UpdateVoucherItem[]) => {
    if (USE_MOCK_VOUCHER_API) {
      for (const item of items) {
        const voucher = mockVouchers.find((current) => current.id === item.id)
        if (!voucher) continue
        Object.assign(voucher, item, { updatedAt: new Date().toISOString() })
      }
      return 'Update voucher successfully'
    }
    const { data } = await this.put<BaseResponse<string>>('/v1/admin/vouchers', { items })
    return data.value
  }

  setVouchersActive = async (ids: string[], isActive: boolean) => {
    if (USE_MOCK_VOUCHER_API) {
      ids.forEach((voucherId) => {
        const voucher = mockVouchers.find((current) => current.id === voucherId)
        if (voucher) {
          voucher.isActive = isActive
        }
      })
      return 'Voucher status updated successfully.'
    }
    const { data } = await this.patch<BaseResponse<string>>('/v1/admin/vouchers/active', { ids, isActive })
    return data.value
  }

  deleteVoucher = async (voucherId: string) => {
    if (USE_MOCK_VOUCHER_API) {
      const voucher = mockVouchers.find((current) => current.id === voucherId)
      if (voucher) voucher.isDeleted = true
      return 'Voucher deleted'
    }
    const { data } = await this.delete<BaseResponse<string>>(`/v1/admin/vouchers/${voucherId}`)
    return data.value
  }

  createProgram = async (payload: CreateProgramPayload) => {
    if (USE_MOCK_VOUCHER_API) {
      const program: VoucherProgram = {
        id: id('program'),
        name: payload.name,
        isActive: false,
        startAt: payload.startAt,
        endAt: payload.endAt,
        minOrderAmount: payload.minOrderAmount ?? null,
        maxOrderAmount: payload.maxOrderAmount ?? null,
        voucherCount: 0,
        usedVoucherCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: null
      }
      mockPrograms.unshift(program)
      return 'Create voucher program successfully'
    }
    const { data } = await this.post<BaseResponse<string>>('/v1/admin/voucher-programs', payload)
    return data.value
  }

  updateProgram = async ({ id: programId, ...payload }: UpdateProgramPayload) => {
    if (USE_MOCK_VOUCHER_API) {
      const program = mockPrograms.find((current) => current.id === programId)!
      Object.assign(program, payload, { updatedAt: new Date().toISOString() })
      if (payload.isActive !== undefined)
        mockVouchers
          .filter((voucher) => voucher.programId === programId && !voucher.isDeleted)
          .forEach((voucher) => Object.assign(voucher, { isActive: payload.isActive }))
      mockVouchers
        .filter((voucher) => voucher.programId === programId && !voucher.isDeleted)
        .forEach((voucher) =>
          Object.assign(voucher, {
            startAt: program.startAt,
            endAt: program.endAt,
            minOrderAmount: program.minOrderAmount,
            maxOrderAmount: program.maxOrderAmount,
            programName: program.name
          })
        )
      return program
    }
    const { data } = await this.put<BaseResponse<VoucherProgram>>(`/v1/admin/voucher-programs/${programId}`, payload)
    return data.value
  }

  deleteProgram = async (programId: string) => {
    if (USE_MOCK_VOUCHER_API) {
      const program = mockPrograms.find((current) => current.id === programId)
      if (program) program.isDeleted = true
      mockVouchers
        .filter((voucher) => voucher.programId === programId)
        .forEach((voucher) => {
          voucher.isDeleted = true
        })
      return 'Program deleted'
    }
    const { data } = await this.delete<BaseResponse<string>>(`/v1/admin/voucher-programs/${programId}`)
    return data.value
  }

  generateVouchers = async (programId: string, payload: GenerateVouchersPayload) => {
    if (USE_MOCK_VOUCHER_API) {
      const program = mockPrograms.find((current) => current.id === programId)!
      const codes: string[] = []
      for (let index = 0; index < payload.quantity; index += 1) {
        const code = `${payload.codePrefix ?? ''}${Math.random()
          .toString(36)
          .slice(2, 2 + payload.codeLength)
          .toUpperCase()}${payload.codeSuffix ?? ''}`
        codes.push(code)
        mockVouchers.push({
          id: id('voucher'),
          programId,
          programName: program.name,
          code,
          description: payload.description ?? null,
          visibility: 'private',
          isActive: false,
          discountType: payload.discountType,
          discountValue: payload.discountValue,
          maxDiscountAmount: payload.maxDiscountAmount ?? null,
          maxUsageCount: payload.maxUsageCount,
          usedCount: 0,
          startAt: program.startAt,
          endAt: program.endAt,
          minOrderAmount: program.minOrderAmount,
          maxOrderAmount: program.maxOrderAmount,
          createdAt: new Date().toISOString(),
          updatedAt: null
        })
      }
      program.voucherCount += payload.quantity
      return { programId, createdCount: payload.quantity, codes }
    }
    const { data } = await this.post<BaseResponse<{ programId: string; createdCount: number; codes: string[] }>>(
      `/v1/admin/voucher-programs/${programId}/vouchers`,
      payload
    )
    return data.value
  }

  getUsages = async (voucherId: string, params: PageParams): Promise<VoucherUsagePage> => {
    if (USE_MOCK_VOUCHER_API) return pageOf(mockUsages[voucherId] ?? [], params.pageIndex, params.pageSize)
    const { data } = await this.get<BasePaginationResponse<VoucherUsage>>(`/v1/admin/vouchers/${voucherId}/usages`, {
      params
    })
    return data.value
  }

  exportVouchers = async (params: { visibility?: string; programIds?: string[] }) => {
    if (USE_MOCK_VOUCHER_API) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 14)
      const fileName = params.programIds?.length
        ? params.programIds.length === 1
          ? `vouchers-program-${params.programIds[0].slice(0, 8)}-${timestamp}.xlsx`
          : `vouchers-programs-${params.programIds.length}-${timestamp}.xlsx`
        : `vouchers-${params.visibility ?? 'all'}-${timestamp}.xlsx`
      const escapeCsv = (value: unknown) => {
        const text = value == null ? '' : String(value)
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
      }
      const content = [
        'Id,ProgramId,ProgramName,Code,Description,Visibility,IsActive,DiscountType,DiscountValue,MaxDiscountAmount,MaxUsageCount,UsedCount,StartAt,EndAt,MinOrderAmount,MaxOrderAmount,CreatedAt,UpdatedAt,IsDeleted',
        ...mockVouchers
          .filter(
            (voucher) =>
              !voucher.isDeleted &&
              (!params.visibility || params.visibility === 'all' || voucher.visibility === params.visibility) &&
              (!params.programIds?.length || params.programIds.includes(voucher.programId ?? ''))
          )
          .map((voucher) => {
            const program = voucher.programId
              ? mockPrograms.find((item) => item.id === voucher.programId && !item.isDeleted)
              : undefined
            return [
              voucher.id,
              voucher.programId,
              program?.name ?? voucher.programName,
              voucher.code,
              voucher.description,
              voucher.visibility,
              voucher.isActive,
              voucher.discountType,
              voucher.discountValue,
              voucher.maxDiscountAmount,
              voucher.maxUsageCount,
              voucher.usedCount,
              program?.startAt ?? voucher.startAt,
              program?.endAt ?? voucher.endAt,
              program?.minOrderAmount ?? voucher.minOrderAmount,
              program?.maxOrderAmount ?? voucher.maxOrderAmount,
              voucher.createdAt,
              voucher.updatedAt,
              false
            ]
              .map(escapeCsv)
              .join(',')
          })
      ].join('\n')
      return { blob: new Blob([content], { type: 'text/csv;charset=utf-8' }), fileName } satisfies VoucherExportFile
    }
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
