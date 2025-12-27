import api, { type BasePaginationResponse } from '@/lib/axios'
import type { DomainEntity } from '@/types/domain.type'

class DomainService {
  private readonly baseUrl = 'domains'

  getDomains = async () => {
    const { data } = await api.get<BasePaginationResponse<DomainEntity>>(`/v1/${this.baseUrl}`)

    return data
  }
}

const domainService = new DomainService()
export default domainService
