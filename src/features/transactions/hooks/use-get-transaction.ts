import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import type { Transaction } from '@/types/transaction.type'
import type { Query } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

export const useGetTransaction = ({
  transactionId,
  refetchInterval
}: {
  transactionId?: string
  refetchInterval?: number | false | ((query: Query<Transaction | null>) => number | false | undefined)
}) => {
  const { data: transaction, isLoading: isLoadingTransaction } = useQuery<Transaction | null>({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: () => transactionService.getTransaction({ transactionId }),
    enabled: !!transactionId,
    refetchInterval
  })

  return { transaction, isLoadingTransaction }
}
