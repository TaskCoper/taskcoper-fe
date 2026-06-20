import { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { ConfigRecord, ConfigRecordValue, ConfigSystemItem } from './types'

class ConfigSystemService {
  private readonly legacyUrl = 'v1/config'
  private readonly baseUrl = 'api/v1/config'

  // ─── Legacy endpoints (kept for existing components) ──────────────────────

  getConfigs = async () => {
    const { data } = await htmApi.get<BasePaginationResponse<ConfigSystemItem>>(`/${this.legacyUrl}`)
    return data
  }

  updateConfigActive = async ({ key, isActive }: { key: string; isActive: boolean }) => {
    const { data } = await htmApi.patch<BaseResponse<ConfigSystemItem>>(`/${this.legacyUrl}/${key}`, { isActive })
    return data.value
  }

  // ─── New CRUD endpoints ───────────────────────────────────────────────────

  getConfigRecords = async (params: { pageIndex?: number; pageSize?: number } = {}) => {
    const { data } = await htmApi.get<BasePaginationResponse<ConfigRecord>>(`/${this.baseUrl}`, {
      params: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 100 }
    })
    return data
  }

  createConfigRecord = async (body: { key: string; value: ConfigRecordValue }) => {
    const { data } = await htmApi.post<BaseResponse<ConfigRecord>>(`/${this.baseUrl}`, body)
    return data.value
  }

  updateConfigRecord = async ({ id, body }: { id: string; body: { key: string; value: ConfigRecordValue } }) => {
    const { data } = await htmApi.put<BaseResponse<ConfigRecord>>(`/${this.baseUrl}/${id}`, body)
    return data.value
  }

  deleteConfigRecord = async ({ id }: { id: string }) => {
    await htmApi.delete(`/${this.baseUrl}/${id}`)
  }
}

const configSystemService = new ConfigSystemService()
export default configSystemService
