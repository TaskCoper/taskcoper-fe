import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetDomainsParams } from './hooks/use-get-domains'
import type { Domain, DomainStats } from './types'

class DomainService extends BaseService {
  private readonly baseUrl = 'domains'

  getDomains = async ({ searchTerm, pageIndex, pageSize }: GetDomainsParams) => {
    const { data } = await this.get<BasePaginationResponse<Domain>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        searchTerm
      }
    })

    return data
  }

  getDomainStats = async () => {
    const { data } = await this.get<BaseResponse<DomainStats[]>>(`/v1/${this.baseUrl}/statistic`)

    return data.value
  }
}

const domainService = new DomainService()
export default domainService
