import type { TransactionTypeStats } from '@/features/transactions/types'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import transactionService from '../services'

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
