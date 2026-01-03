import type { GetDomainsParams } from '@/hooks/use-get-domains'
import api, { type BasePaginationResponse } from '@/lib/axios'
import type { Domain } from '@/types/domain.type'

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
}

const domainService = new DomainService()
export default domainService
