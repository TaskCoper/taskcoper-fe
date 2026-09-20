import { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { CARD_SIZES_KEY, parseCardSizes } from '../configs/card-config-palette'
import type { Config } from '../configs/types'
import { BaseService } from '../../services/base.service'
import type {
  GeneratedFlowerHistoryItem,
  GeneratedFlowerDetail,
  GetAiFlowerDesignHistoryParams,
  GeneratedCardDetailItem,
  GeneratedCardDownload,
  GeneratedCardHistoryItem,
  GetAiCardHistoryParams
} from './types'

class GenerateAiCustomService extends BaseService {
  private readonly baseUrl = '/v1/admin/generated-cards'
  private readonly generatedFlowersBaseUrl = '/v1/admin/generated-flowers'

  getAiCardHistory = async (params: GetAiCardHistoryParams) => {
    const { data } = await this.get<BasePaginationResponse<GeneratedCardHistoryItem>>(this.baseUrl, { params })
    return data.value
  }

  getAiCardHistoryDetail = async (generatedCardId: string) => {
    const query = new URLSearchParams({
      id: generatedCardId,
      pageIndex: '1',
      pageSize: '5'
    })
    const { data } = await this.get<BasePaginationResponse<GeneratedCardDetailItem>>(
      `${this.baseUrl}?${query.toString()}`
    )
    return data.value.items[0] ?? null
  }

  getAiCardDownload = async (generatedCardId: string) => {
    const { data } = await this.get<BaseResponse<GeneratedCardDownload>>(`${this.baseUrl}/${generatedCardId}/download`)
    return data.value
  }

  getAiCardSizes = async () => {
    const { data } = await this.get<BaseResponse<Config[]>>('/v1/configs/settings', {
      params: { key: CARD_SIZES_KEY }
    })
    const rawValue = data.value?.[0]?.value?.value

    return parseCardSizes(rawValue)
  }

  getAiFlowerDesignHistory = async (params: GetAiFlowerDesignHistoryParams) => {
    const { data } = await this.get<BasePaginationResponse<GeneratedFlowerHistoryItem>>(this.generatedFlowersBaseUrl, {
      params
    })
    return data.value
  }

  getAiFlowerDesignDetail = async (generatedFlowerId: string) => {
    const query = new URLSearchParams({
      generatedFlowerId,
      pageIndex: '1',
      pageSize: '5'
    })
    const { data } = await this.get<BasePaginationResponse<GeneratedFlowerDetail>>(
      `${this.generatedFlowersBaseUrl}?${query.toString()}`
    )
    return data.value.items[0] ?? null
  }
}

const generateAiService = new GenerateAiCustomService()
export default generateAiService
