import type { BasePaginationResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { JobDescriptionsParams } from './hooks/use-get-job-descriptions'
import type { JobDescription } from './types'

class JobDescriptionService {
  private readonly baseUrl = 'job-descriptions'

  getJobDescriptions = async ({
    page,
    pageSize,
    title,
    location,
    status,
    employmentType,
    salaryMin,
    salaryMax
  }: JobDescriptionsParams) => {
    const { data } = await htmApi.get<BasePaginationResponse<JobDescription>>(`v1/${this.baseUrl}`, {
      params: {
        page,
        pageSize,
        title,
        location,
        status,
        employmentType,
        salaryMin,
        salaryMax
      }
    })

    return data
  }
}

const jobDescriptionService = new JobDescriptionService()
export default jobDescriptionService
