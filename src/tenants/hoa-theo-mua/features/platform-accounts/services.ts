import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { MarketingPostPlatform } from '../marketing-posts/types'
import type { PlatformAccount, PlatformAccountSession } from './types'

class PlatformAccountService extends BaseService {
  private readonly baseUrl = 'post-gen/platform-accounts'

  getPlatformAccounts = async ({ platform }: { platform?: MarketingPostPlatform } = {}) => {
    const { data } = await this.get<BaseResponse<PlatformAccount[]>>(`/v1/${this.baseUrl}`, { params: { platform } })

    return data.value
  }

  // Trả về phiên OAuth kèm cookie proof; phải gọi từ chính trình duyệt sẽ mở authorizationUrl
  connectPlatformAccount = async ({ platform }: { platform: MarketingPostPlatform }) => {
    const { data } = await this.post<BaseResponse<PlatformAccountSession>>(`/v1/${this.baseUrl}/${platform}/connect`)

    return data.value
  }

  reconnectPlatformAccount = async ({ id }: { id: string }) => {
    const { data } = await this.post<BaseResponse<PlatformAccountSession>>(`/v1/${this.baseUrl}/${id}/reconnect`)

    return data.value
  }

  // Meta không có refresh token: endpoint này chỉ kiểm tra token hiện có còn sống không
  refreshPlatformAccount = async ({ id }: { id: string }) => {
    const { data } = await this.post<BaseResponse<PlatformAccount>>(`/v1/${this.baseUrl}/${id}/refresh`)

    return data.value
  }

  // Chỉ xoá credentials phía mình, account giữ nguyên id và chuyển sang Disabled
  disconnectPlatformAccount = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<PlatformAccount>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const platformAccountService = new PlatformAccountService()
export default platformAccountService
