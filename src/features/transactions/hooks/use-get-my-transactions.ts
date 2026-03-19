import { queryKeys } from '@/lib/query-keys'
import transactionService from '@/services/transaction.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TransactionRow } from '@/types/transaction.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMyTransactionsParams {
  pageIndex?: number
  pageSize?: number
  status?: string[]
  type?: string[]
  sortBy?: string
  searchTerm?: string
  createdFrom?: string
  createdTo?: string
}

export const useGetMyTransactions = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  status,
  type,
  sortBy,
  searchTerm,
  createdFrom,
  createdTo
}: GetMyTransactionsParams = {}) => {
  const {
    data: transactions = getDefaultPaginationResponse<TransactionRow>().value,
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: queryKeys.transactions.my({
      pageIndex,
      pageSize,
      status,
      type,
      sortBy,
      searchTerm,
      createdFrom,
      createdTo
    }),
    queryFn: () =>
      transactionService.getMyTransactions({
        pageIndex,
        pageSize,
        status,
        type,
        sortBy,
        searchTerm,
        createdFrom,
        createdTo
      })
  })

  return { transactions, isLoadingTransactions }
}
