import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { SystemPromptDetail, SystemPromptSummary, UpdateSystemPromptBody } from './types'

class SystemPromptService extends BaseService {
  private readonly baseUrl = 'system-prompts'

  getSystemPrompts = async () => {
    const { data } = await this.get<BaseResponse<SystemPromptSummary[]>>(`/v1/${this.baseUrl}`)

    return data.value
  }

  getSystemPrompt = async (id: string) => {
    const { data } = await this.get<BaseResponse<SystemPromptDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  updateSystemPrompt = async (id: string, body: UpdateSystemPromptBody) => {
    const { data } = await this.put<BaseResponse<SystemPromptDetail>, UpdateSystemPromptBody>(
      `/v1/${this.baseUrl}/${id}`,
      body
    )

    return data.value
  }
}

export default new SystemPromptService()
