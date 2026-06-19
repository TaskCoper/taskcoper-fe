import { createApiClient } from '@/lib/axios'
import config from '@/shared/config'

export const htmApi = createApiClient(`${config.hoaTheoMuaBaseURL}/ecommerce-api`)

export default htmApi
