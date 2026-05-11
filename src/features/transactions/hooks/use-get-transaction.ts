import type { Transaction } from '@/features/transactions/types'
import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import transactionService from '../services'

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
