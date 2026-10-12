import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { Config, GetConfigsParams } from './types'
import type { CreateConfigFormValues } from './validations'
import type { OrderTagsConfig, UpdateDeliverySlotLimitsBody } from './types/order-slots'

class ConfigService extends BaseService {
  private readonly baseUrl = 'configs'

  getConfigs = async () => {
    const { data } = await this.get<BaseResponse<Config[]>>(`/v1/${this.baseUrl}`)

    return data.value
  }

  getSettingConfigs = async ({ groupName, key }: GetConfigsParams) => {
    const { data } = await this.get<BaseResponse<Config[]>>(`/v1/${this.baseUrl}/settings`, {
      params: { groupName, key }
    })

    return data.value
  }

  getContentConfigs = async ({ groupName, key, isPublic }: GetConfigsParams & { isPublic?: boolean }) => {
    const { data } = await this.get<BaseResponse<Config[]>>(`/v1/${this.baseUrl}/content`, {
      params: { groupName, key, isPublic }
    })

    return data.value
  }

  getSecretConfigs = async ({ groupName, key }: GetConfigsParams) => {
    const { data } = await this.get<BaseResponse<Config[]>>(`/v1/${this.baseUrl}/secrets`, {
      params: { groupName, key }
    })

    return data.value
  }

  revealSecretConfig = async ({ id }: { id: string }) => {
    const { data } = await this.post<BaseResponse<Config>>(`/v1/${this.baseUrl}/secrets/reveal/id`, id)

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

  getOrderTagsConfig = async () => {
    const { data } = await this.get<BaseResponse<OrderTagsConfig>>('/v1/configs/order-tags')

    return data.value
  }

  updateDeliverySlotLimits = async ({ body }: { body: UpdateDeliverySlotLimitsBody }) => {
    const { data } = await this.patch<
      BaseResponse<{
        slots: Array<{ tagId: number; label: string; limit: number }>
        updatedAt: string
      }>
    >('/v1/delivery-slots/limits', body)

    return data.value
  }
}

const configService = new ConfigService()
export default configService
