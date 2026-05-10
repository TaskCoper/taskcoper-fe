import type { GetDomainsParams } from '@/features/domains/hooks/use-get-domains'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Domain, DomainStats } from './types'

class DomainService {
  private readonly baseUrl = 'domains'

  getDomains = async ({ searchTerm, pageIndex, pageSize }: GetDomainsParams) => {
    const { data } = await api.get<BasePaginationResponse<Domain>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        searchTerm
      }
    })

    return data
  }

  getDomainStats = async () => {
    const { data } = await api.get<BaseResponse<DomainStats[]>>(`/v1/${this.baseUrl}/statistic`)

    return data.value
  }
}

const domainService = new DomainService()
export default domainService
