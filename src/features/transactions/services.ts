import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMyTransactionsParams } from './hooks/use-get-my-transactions'
import type { Transaction, TransactionRow, TransactionStatusStats, TransactionTypeStats } from './types'

class TransactionService extends BaseService {
  private readonly baseUrl = 'transactions'

  getTransaction = async ({ transactionId }: { transactionId?: string }) => {
    if (!transactionId) return null
    const { data } = await this.get<BaseResponse<Transaction>>(`/v1/${this.baseUrl}/${transactionId}`)

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
    const { data } = await this.get<BasePaginationResponse<TransactionRow>>(`/v1/${this.baseUrl}/me`, {
      params: { pageIndex, pageSize, status, type, sortBy, searchTerm, createdFrom, createdTo }
    })

    return data.value
  }

  getTransactionStatusStats = async () => {
    const { data } = await this.get<BasePaginationResponse<TransactionStatusStats>>(
      `/v1/${this.baseUrl}/me/statistics/status`
    )

    return data
  }

  getTransactionTypeStats = async () => {
    const { data } = await this.get<BasePaginationResponse<TransactionTypeStats>>(
      `/v1/${this.baseUrl}/me/statistics/type`
    )

    return data
  }

  getTransactionStatus = async ({ transactionId }: { transactionId?: string }) => {
    if (!transactionId) return null
    const { data } = await this.get<
      BaseResponse<Pick<Transaction, 'transactionId' | 'targetModel' | 'targetModelId' | 'status' | 'paidAt'>>
    >(`/v1/${this.baseUrl}/${transactionId}/status`)

    return data.value
  }
}

const transactionService = new TransactionService()
export default transactionService
