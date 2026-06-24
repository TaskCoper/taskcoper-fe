import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { AddMentorPackageRuleFormValues, UpdateMentorPackageRuleFormValues } from './validations'

class MentorPackageRuleService extends BaseService {
  private readonly baseUrl = 'mentor-package-rules'

  addMentorPackageRule = async ({ body }: { body: AddMentorPackageRuleFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  updateMentorPackageRule = async ({ body }: { body: UpdateMentorPackageRuleFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  deleteMentorPackageRule = async ({ ruleId }: { ruleId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/mentorPackage/${ruleId}`)

    return data.value
  }
}

const mentorPackageRuleService = new MentorPackageRuleService()
export default mentorPackageRuleService
