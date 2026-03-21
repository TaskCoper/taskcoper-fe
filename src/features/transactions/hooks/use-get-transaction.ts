import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import type { Transaction } from '@/types/transaction.type'
import { useQuery } from '@tanstack/react-query'

interface UseGetTransactionProps {
  transactionId?: string
}

export const useGetTransaction = ({ transactionId }: UseGetTransactionProps) => {
  const { data: transaction, isLoading: isLoadingTransaction } = useQuery<Transaction | null>({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: () => transactionService.getTransaction({ transactionId }),
    enabled: !!transactionId
  })

  return { transaction, isLoadingTransaction }
}
