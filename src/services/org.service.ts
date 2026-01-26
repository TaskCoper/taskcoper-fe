import api, { type BaseResponse } from '@/lib/axios'
import type { Organization } from '@/types/org.type'

class OrgService {
  private readonly baseUrl = 'organization'

  getOrg = async ({ orgId }: { orgId?: string }) => {
    if (!orgId) return null
    const { data } = await api.get<BaseResponse<Organization>>(`/v1/${this.baseUrl}/${orgId}`)

    return data.value
  }
}

const orgService = new OrgService()
export default orgService
