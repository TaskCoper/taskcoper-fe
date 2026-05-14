import { api, type BaseResponse } from '@/lib/axios'

class GoogleService {
  private readonly baseUrl = 'integrations/google'

  getGoogleAuthUrl = async () => {
    const { data } = await api.get<BaseResponse<{ authorizeUrl: string }>>(`/v1/${this.baseUrl}/authorize-url`)

    return data.value.authorizeUrl
  }

  verifyGoogleCallback = async ({ code }: { code: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/callback`, { code })

    return data.value
  }
}

const googleService = new GoogleService()
export default googleService
