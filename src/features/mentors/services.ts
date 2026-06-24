import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMentorsParams } from './hooks/use-get-mentors'
import type { Mentor } from './types'
import type { UpdateMentorProfileFormValues } from './validations'

class MentorService extends BaseService {
  private readonly baseUrl = 'mentors'

  getMentors = async ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) => {
    const { data } = await this.get<BasePaginationResponse<Mentor>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        domainIds,
        searchTerm,
        rating,
        sortBy
      }
    })

    return data
  }

  updateMentorProfile = async ({ body }: { body: UpdateMentorProfileFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.userIdentifier}`, body)

    return data.value
  }
}

const mentorService = new MentorService()
export default mentorService
