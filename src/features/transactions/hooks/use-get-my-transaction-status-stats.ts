import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import transactionService from '../services'
import type { TransactionStatusStats } from '../types'

export const useGetMyTransactionStatusStats = () => {
  const {
    data: transactionStatusStats = getDefaultPaginationResponse<TransactionStatusStats>(),
    isLoading: isLoadingTransactionStatusStats
  } = useQuery({
    queryKey: queryKeys.transactions.statusStats(),
    queryFn: transactionService.getTransactionStatusStats
  })

  return { transactionStatusStats, isLoadingTransactionStatusStats }
}
