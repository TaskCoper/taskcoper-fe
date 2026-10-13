import { useQuery } from '@tanstack/react-query'
import voucherService from '../services'
import { voucherKeys } from './query-keys'

export const useGetVoucherProgram = (programId?: string) => {
  const program = useQuery({
    queryKey: voucherKeys.programDetail(programId ?? ''),
    queryFn: () => voucherService.getProgram(programId!),
    enabled: Boolean(programId)
  })

  return { program, isGettingProgram: program.isLoading }
}
