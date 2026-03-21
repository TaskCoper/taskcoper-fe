import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import { useQuery } from '@tanstack/react-query'

export const useGetTransactionStatus = ({ transactionId }: { transactionId?: string }) => {
  const { data: transactionStatus, isLoading: isLoadingTransactionStatus } = useQuery({
    queryKey: queryKeys.transactions.status(transactionId),
    queryFn: () => transactionService.getTransactionStatus({ transactionId }),
    enabled: !!transactionId,
    refetchInterval: (dataOrQuery) => {
      const data = dataOrQuery?.state?.data
      const status = data?.status?.toLowerCase()

      if (status && status !== 'pending') {
        return false
      }

      return 2000
    }
  })

  return { transactionStatus, isLoadingTransactionStatus }
}
