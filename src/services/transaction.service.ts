import { api, type BaseResponse } from '@/lib/axios'
import type { Transaction } from '@/types/transaction.type'

class TransactionService {
  private readonly baseUrl = 'transactions'

  getTransaction = async ({ transactionId }: { transactionId?: string }) => {
    if (!transactionId) return null
    const { data } = await api.get<BaseResponse<Transaction>>(`/v1/${this.baseUrl}/${transactionId}`)

    return data.value
  }
}

const transactionService = new TransactionService()
export default transactionService
