import type { BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { Config } from './types'
import type { CreateConfigFormValues } from './validations'

class ConfigService {
  private readonly baseUrl = 'configs'

  getConfigs = async () => {
    const { data } = await htmApi.get<BaseResponse<Config[]>>(`v1/${this.baseUrl}`)

    return data.value
  }

  createConfig = async ({ body }: { body: CreateConfigFormValues }) => {
    const { data } = await htmApi.post<BaseResponse<Config>>(`v1/${this.baseUrl}`, body)

    return data.value
  }

  updateConfig = async ({ id, body }: { id: string; body: CreateConfigFormValues }) => {
    const { data } = await htmApi.put<BaseResponse<Config>>(`v1/${this.baseUrl}/${id}`, body)

    return data.value
  }

  deleteConfig = async ({ id }: { id: string }) => {
    const { data } = await htmApi.delete<BaseResponse<Config>>(`v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const configService = new ConfigService()
export default configService
