import { useMemo } from 'react'
import type { ProgramVoucherItem } from '../types'
import { useGetVoucherProgram } from './use-get-voucher-program'

interface GetVoucherProgramCodesParams {
  keyword?: string
  pageIndex: number
  pageSize: number
}

const EMPTY_VOUCHERS: ProgramVoucherItem[] = []

export const useGetVoucherProgramCodes = (
  programId: string | undefined,
  { keyword, pageIndex, pageSize }: GetVoucherProgramCodesParams
) => {
  const { program: programQuery, isGettingProgram } = useGetVoucherProgram(programId)
  const program = programQuery.data

  const filteredCodes = useMemo(() => {
    const codes = program?.vouchers ?? EMPTY_VOUCHERS
    const search = keyword?.trim().toLowerCase()
    if (!search) return codes

    return codes.filter(
      (voucher) => voucher.code.toLowerCase().includes(search) || voucher.description?.toLowerCase().includes(search)
    )
  }, [program?.vouchers, keyword])

  const pageCount = Math.ceil(filteredCodes.length / pageSize) || 1
  const codes = useMemo(() => {
    const currentPage = Math.min(pageIndex, pageCount)
    return filteredCodes.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredCodes, pageIndex, pageCount, pageSize])

  return { program, codes, pageCount, isGettingProgram }
}
