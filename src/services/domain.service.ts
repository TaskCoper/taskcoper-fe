import api, { type BasePaginationResponse } from '@/lib/axios'
import type { Domain } from '@/types/domain.type'

class DomainService {
  private readonly baseUrl = 'domains'

  getDomains = async () => {
    const { data } = await api.get<BasePaginationResponse<Domain>>(`/v1/${this.baseUrl}`)

    return data
  }
}

const domainService = new DomainService()
export default domainService
