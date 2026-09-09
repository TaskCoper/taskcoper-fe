import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type {
  AiFlowerDesignHistoryItem,
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
    const { data } = await this.get<BaseResponse<GeneratedCardDetailItem>>(`${this.baseUrl}/${generatedCardId}`)
    return data.value
  }

  getAiCardDownload = async (generatedCardId: string) => {
    const { data } = await this.get<BaseResponse<GeneratedCardDownload>>(`${this.baseUrl}/${generatedCardId}/download`)
    return data.value
  }

  getAiFlowerDesignHistory = async (params: GetAiFlowerDesignHistoryParams) => {
    const { data } = await this.get<BasePaginationResponse<AiFlowerDesignHistoryItem>>(this.generatedFlowersBaseUrl, {
      params
    })
    return data.value
  }
}

const generateAiService = new GenerateAiCustomService()
export default generateAiService
