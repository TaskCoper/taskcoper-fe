import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import transactionService from '../services'
import type { TransactionTypeStats } from '../types'

export const useGetMyTransactionTypeStats = () => {
  const {
    data: transactionTypeStats = getDefaultPaginationResponse<TransactionTypeStats>(),
    isLoading: isLoadingTransactionTypeStats
  } = useQuery({
    queryKey: queryKeys.transactions.typeStats(),
    queryFn: transactionService.getTransactionTypeStats
  })

  return { transactionTypeStats, isLoadingTransactionTypeStats }
}
