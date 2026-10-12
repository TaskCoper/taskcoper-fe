import type { GetProgramCodesParams, GetProgramsParams, GetVouchersParams, PageParams } from '../types'

export const voucherKeys = {
  all: ['admin-vouchers'] as const,
  vouchers: () => [...voucherKeys.all, 'vouchers'] as const,
  voucherList: (params: GetVouchersParams) => [...voucherKeys.vouchers(), params] as const,
  programs: () => [...voucherKeys.all, 'programs'] as const,
  programList: (params: GetProgramsParams) => [...voucherKeys.programs(), params] as const,
  programDetail: (id: string) => [...voucherKeys.programs(), 'detail', id] as const,
  programCodes: (id: string, params: GetProgramCodesParams) =>
    [...voucherKeys.programs(), 'codes', id, params] as const,
  usages: (id: string, params: PageParams) => [...voucherKeys.all, 'usages', id, params] as const
}
