import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { Config } from './types'
import type { CreateConfigFormValues } from './validations'

class ConfigService extends BaseService {
  private readonly baseUrl = 'configs'

  getConfigs = async () => {
    const { data } = await this.get<BaseResponse<Config[]>>(`/v1/${this.baseUrl}`)

    return data.value
  }

  getConfig = async ({ id }: { id: string }) => {
    const { data } = await this.get<BaseResponse<Config>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  createConfig = async ({ body }: { body: CreateConfigFormValues }) => {
    const { data } = await this.post<BaseResponse<Config>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  updateConfig = async ({ id, body }: { id: string; body: CreateConfigFormValues }) => {
    const { data } = await this.put<BaseResponse<Config>>(`/v1/${this.baseUrl}/${id}`, body)

    return data.value
  }

  deleteConfig = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<Config>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const configService = new ConfigService()
export default configService
