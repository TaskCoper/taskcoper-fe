import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { JobDescriptionsParams } from './hooks/use-get-job-descriptions'
import type { JobDescription } from './types'
import type { CreateJobDescriptionFormValues } from './validations'

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

  createJobDescription = async ({ body }: { body: CreateJobDescriptionFormValues }) => {
    const { data } = await htmApi.post<BaseResponse<string>>(`v1/${this.baseUrl}`, {
      ...body,
      level: Number(body.level),
      employmentType: Number(body.employmentType),
      status: Number(body.status),
      openings: Number(body.openings),
      minExperienceYears: Number(body.minExperienceYears),
      maxExperienceYears: Number(body.maxExperienceYears),
      salaryMin: Number(body.salaryMin),
      salaryMax: Number(body.salaryMax)
    })

    return data.value
  }
}

const jobDescriptionService = new JobDescriptionService()
export default jobDescriptionService
