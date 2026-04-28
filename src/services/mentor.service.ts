import type { GetMentorsParams } from '@/features/mentors/hooks/use-get-mentors'
import type { UpdateMentorProfileFormValues } from '@/features/mentors/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Mentor } from '@/types/user.type'

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
