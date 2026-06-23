import { HOA_THEO_MUA_ORG_ID, hoaTheoMuaConfig } from '@/tenants/hoa-theo-mua/config'
import type { TenantConfig } from './types'

export const TENANT_CONFIGS: Record<string, TenantConfig> = {
  [HOA_THEO_MUA_ORG_ID]: hoaTheoMuaConfig
}
