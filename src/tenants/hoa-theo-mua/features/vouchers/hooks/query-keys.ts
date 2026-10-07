import type { GetProgramsParams, GetVouchersParams, PageParams } from '../types'

export const voucherKeys = {
  all: ['admin-vouchers'] as const,
  vouchers: () => [...voucherKeys.all, 'vouchers'] as const,
  voucherList: (params: GetVouchersParams) => [...voucherKeys.vouchers(), params] as const,
  programs: () => [...voucherKeys.all, 'programs'] as const,
  programList: (params: GetProgramsParams) => [...voucherKeys.programs(), params] as const,
  usages: (id: string, params: PageParams) => [...voucherKeys.all, 'usages', id, params] as const
}
