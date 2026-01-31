import { api, type BaseResponse } from '@/lib/axios'
import type { RoleStats } from '@/types/role.type'

class RoleService {
  private readonly baseUrl = 'roles'

  getRoleStats = async () => {
    const { data } = await api.get<BaseResponse<RoleStats[]>>(`/v1/${this.baseUrl}/statistic`)

    return data.value
  }
}

const roleService = new RoleService()
export default roleService
