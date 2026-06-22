import { createApiClient } from '@/lib/axios'
import config from '@/shared/config'

export const htmApi = createApiClient(`${config.hoaTheoMuaBaseURL}/api`, {
  refreshTokenPath: '/v1/auth/refresh',
  expiredAccessTokenCodes: ['EXPIRED_ACCESS_TOKEN', 'MISSING_ACCESS_TOKEN', 'INVALID_ACCESS_TOKEN'],
  expiredRefreshTokenCode: 'EXPIRED_REFRESH_TOKEN'
})

export default htmApi
