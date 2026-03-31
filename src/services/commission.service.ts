import type { GetCommissionsParams } from '@/features/commissions/hooks/use-get-commissions'
import type { CreateCommissionFormValues, UpdateCommissionFormValues } from '@/features/commissions/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { CommissionRow } from '@/types/commission.type'

class CommissionService {
  private readonly baseUrl = 'commissions'

  createCommission = async ({ body }: { body: CreateCommissionFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
      ...body,
      rate: body.rate / 100
    })

    return data.value
  }

  getCommissions = async ({
    page,
    limit,
    targetModel,
    titleLevel,
    minAmount,
    maxAmount,
    sortBy
  }: GetCommissionsParams) => {
    const { data } = await api.get<BasePaginationResponse<CommissionRow>>(`/v1/${this.baseUrl}`, {
      params: {
        page,
        limit,
        targetModel,
        titleLevel,
        minAmount,
        maxAmount,
        sortBy
      }
    })

    return data
  }

  updateCommission = async ({ body }: { body: UpdateCommissionFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
      ...body,
      rate: body.rate / 100
    })

    return data.value
  }

  deleteCommission = async ({ commissionId }: { commissionId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${commissionId}`)

    return data.value
  }
}

const commissionService = new CommissionService()
export default commissionService
