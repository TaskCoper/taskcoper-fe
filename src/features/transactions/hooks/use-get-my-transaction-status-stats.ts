import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TransactionStatusStats } from '@/types/transaction.type'
import { useQuery } from '@tanstack/react-query'

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
