import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMentorsParams } from './hooks/use-get-mentors'
import type { Mentor } from './types'
import type { UpdateMentorProfileFormValues } from './validations'

class MentorService {
  private readonly baseUrl = 'mentors'

  getMentors = async ({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }: GetMentorsParams) => {
    const { data } = await api.get<BasePaginationResponse<Mentor>>(`/v1/${this.baseUrl}`, {
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
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.userIdentifier}`, body)

    return data.value
  }
}

const mentorService = new MentorService()
export default mentorService
