import { type BasePaginationResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { configs } from './config.system'
export type ConfigSystemItem = (typeof configs)[number]

class ConfigSystemService {
  private readonly baseUrl = 'config/list'

  getConfigs = async () => {
    const { data } = await htmApi.get<BasePaginationResponse<ConfigSystemItem>>(`/v1/${this.baseUrl}`)
    return data
  }
}

const configSystemService = new ConfigSystemService()
export default configSystemService
