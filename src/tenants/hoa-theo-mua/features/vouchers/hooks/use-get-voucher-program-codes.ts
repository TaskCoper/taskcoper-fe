import { keepPreviousData, useQuery } from '@tanstack/react-query'
import voucherService from '../services'
import type { ProgramVoucherItem } from '../types'
import { voucherKeys } from './query-keys'
import { useGetVoucherProgram } from './use-get-voucher-program'

interface GetVoucherProgramCodesParams {
  keyword?: string
  pageIndex: number
  pageSize: number
  enabled?: boolean
}

const EMPTY_VOUCHERS: ProgramVoucherItem[] = []

export const useGetVoucherProgramCodes = (
  programId: string | undefined,
  { keyword, pageIndex, pageSize, enabled = true }: GetVoucherProgramCodesParams
) => {
  const { program: programQuery, isGettingProgram } = useGetVoucherProgram(programId)
  const params = { pageIndex, pageSize, ...(keyword?.trim() ? { keyword: keyword.trim() } : {}) }
  const codesQuery = useQuery({
    queryKey: voucherKeys.programCodes(programId ?? '', params),
    queryFn: () => voucherService.getProgramCodes(programId!, params),
    enabled: Boolean(programId) && enabled,
    placeholderData: keepPreviousData
  })

  const totalCount = codesQuery.data?.totalCount ?? 0
  const pageCount = Math.ceil(totalCount / pageSize) || 1

  return {
    program: programQuery.data,
    codes: codesQuery.data?.items ?? EMPTY_VOUCHERS,
    pageCount,
    totalCount,
    isGettingProgram,
    isGettingCodes: codesQuery.isLoading
  }
}
