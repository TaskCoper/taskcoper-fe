import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TransactionTypeStats } from '@/types/transaction.type'
import { useQuery } from '@tanstack/react-query'

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
