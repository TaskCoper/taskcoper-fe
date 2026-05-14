import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMyTransactionsParams } from './hooks/use-get-my-transactions'
import type { Transaction, TransactionRow, TransactionStatusStats, TransactionTypeStats } from './types'

class TransactionService {
  private readonly baseUrl = 'transactions'

  getTransaction = async ({ transactionId }: { transactionId?: string }) => {
    if (!transactionId) return null
    const { data } = await api.get<BaseResponse<Transaction>>(`/v1/${this.baseUrl}/${transactionId}`)

    return data.value
  }

  getMyTransactions = async ({
    pageIndex,
    pageSize,
    status,
    type,
    sortBy,
    searchTerm,
    createdFrom,
    createdTo
  }: GetMyTransactionsParams) => {
    const { data } = await api.get<BasePaginationResponse<TransactionRow>>(`/v1/${this.baseUrl}/me`, {
      params: { pageIndex, pageSize, status, type, sortBy, searchTerm, createdFrom, createdTo }
    })

    return data.value
  }

  getTransactionStatusStats = async () => {
    const { data } = await api.get<BasePaginationResponse<TransactionStatusStats>>(
      `/v1/${this.baseUrl}/me/statistics/status`
    )

    return data
  }

  getTransactionTypeStats = async () => {
    const { data } = await api.get<BasePaginationResponse<TransactionTypeStats>>(
      `/v1/${this.baseUrl}/me/statistics/type`
    )

    return data
  }

  getTransactionStatus = async ({ transactionId }: { transactionId?: string }) => {
    if (!transactionId) return null
    const { data } = await api.get<BaseResponse<Pick<Transaction, 'transactionId' | 'status' | 'paidAt'>>>(
      `/v1/${this.baseUrl}/${transactionId}/status`
    )

    return data.value
  }
}

const transactionService = new TransactionService()
export default transactionService
