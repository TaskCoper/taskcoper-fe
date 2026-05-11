import api, { type BaseResponse } from '@/lib/axios'
import type { AddMentorPackageRuleFormValues, UpdateMentorPackageRuleFormValues } from './validations'

class MentorPackageRuleService {
  private readonly baseUrl = 'mentor-package-rules'

  addMentorPackageRule = async ({ body }: { body: AddMentorPackageRuleFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  updateMentorPackageRule = async ({ body }: { body: UpdateMentorPackageRuleFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  deleteMentorPackageRule = async ({ ruleId }: { ruleId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/mentorPackage/${ruleId}`)

    return data.value
  }
}

const mentorPackageRuleService = new MentorPackageRuleService()
export default mentorPackageRuleService
