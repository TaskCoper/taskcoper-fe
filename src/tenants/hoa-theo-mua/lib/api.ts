import { createApiClient } from '@/lib/axios'
import config from '@/shared/config'

export const htmApi = createApiClient(`${config.hoaTheoMuaBaseURL}/api`)

export default htmApi
