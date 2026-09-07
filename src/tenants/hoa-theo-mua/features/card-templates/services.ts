import type { BasePaginationResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type {
  CardTemplateListItem,
  CreateCardTemplatePayload,
  GetCardTemplatesParams,
  UpdateCardTemplatePayload
} from './types'

class CardTemplateService extends BaseService {
  private readonly baseUrl = 'card-templates'

  getCardTemplates = async ({ pageIndex, pageSize, search, isActive, templateType }: GetCardTemplatesParams) => {
    const { data } = await this.get<BasePaginationResponse<CardTemplateListItem>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        search,
        isActive,
        templateType
      }
    })
    return data.value
  }

  getCardTemplate = async (id: string) => {
    const { data } = await this.get<BasePaginationResponse<CardTemplateListItem>>(`/v1/${this.baseUrl}/${id}`)
    return data.value
  }

  addCardTemplate = async (payload: CreateCardTemplatePayload) => {
    const { data } = await this.post<BasePaginationResponse<CardTemplateListItem>>(`/v1/${this.baseUrl}`, payload)
    return data.value
  }

  updateCardTemplate = async (id: string, payload: UpdateCardTemplatePayload) => {
    const { data } = await this.patch<BasePaginationResponse<CardTemplateListItem>>(
      `/v1/${this.baseUrl}/${id}`,
      payload
    )
    return data.value
  }

  changeCardTemplateStatus = async (id: string, payload: UpdateCardTemplatePayload) => {
    const { data } = await this.patch<BasePaginationResponse<CardTemplateListItem>>(
      `/v1/${this.baseUrl}/${id}`,
      payload
    )
    return data.value
  }

  deleteCardTemplate = async (id: string) => {
    const { data } = await this.delete<BasePaginationResponse<CardTemplateListItem>>(`/v1/${this.baseUrl}/${id}`)
    return data.value
  }
}

const cardTemplateService = new CardTemplateService()
export default cardTemplateService
