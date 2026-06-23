import { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { ConfigRecord, ConfigRecordValue, ConfigSystemItem } from './types'

class ConfigSystemService extends BaseService {
  private readonly legacyUrl = 'v1/configs'
  private readonly baseUrl = 'v1/configs'

  // ─── Legacy endpoints (kept for existing components) ──────────────────────

  getConfigs = async () => {
    const { data } = await this.get<BasePaginationResponse<ConfigSystemItem>>(`/${this.legacyUrl}`)
    return data
  }

  updateConfigActive = async ({ key, isActive }: { key: string; isActive: boolean }) => {
    const { data } = await this.patch<BaseResponse<ConfigSystemItem>>(`/${this.legacyUrl}/${key}`, { isActive })
    return data.value
  }

  // ─── New CRUD endpoints ───────────────────────────────────────────────────

  getConfigRecords = async (params: { pageIndex?: number; pageSize?: number } = {}) => {
    const { data } = await this.get<BasePaginationResponse<ConfigRecord>>(`/${this.baseUrl}`, {
      params: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 100 }
    })
    return data
  }

  createConfigRecord = async (body: { key: string; value: ConfigRecordValue }) => {
    const { data } = await this.post<BaseResponse<ConfigRecord>>(`/${this.baseUrl}`, body)
    return data.value
  }

  updateConfigRecord = async ({ id, body }: { id: string; body: { key: string; value: ConfigRecordValue } }) => {
    const { data } = await this.put<BaseResponse<ConfigRecord>>(`/${this.baseUrl}/${id}`, body)
    return data.value
  }

  deleteConfigRecord = async ({ id }: { id: string }) => {
    await this.delete(`/${this.baseUrl}/${id}`)
  }
}

const configSystemService = new ConfigSystemService()
export default configSystemService
