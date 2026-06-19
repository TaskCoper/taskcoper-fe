import { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { ConfigSystemItem } from './types'

class ConfigSystemService {
  private readonly baseUrl = 'config'

  getConfigs = async () => {
    const { data } = await htmApi.get<BasePaginationResponse<ConfigSystemItem>>(`/v1/${this.baseUrl}`)
    return data
  }

  updateConfigActive = async ({ key, isActive }: { key: string; isActive: boolean }) => {
    const { data } = await htmApi.patch<BaseResponse<ConfigSystemItem>>(`/v1/${this.baseUrl}/${key}`, { isActive })
    return data.value
  }
}

const configSystemService = new ConfigSystemService()
export default configSystemService
