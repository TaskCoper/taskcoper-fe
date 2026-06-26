import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { JobDescriptionsParams } from './hooks/use-get-job-descriptions'
import type { JobDescription, JobDescriptionDetail } from './types'
import type { CreateJobDescriptionFormValues } from './validations'

type JobDescriptionBody = Omit<
  CreateJobDescriptionFormValues,
  'employmentType' | 'status' | 'openings' | 'minExperienceYears' | 'maxExperienceYears' | 'salaryMin' | 'salaryMax'
> & {
  employmentType: number
  status: number
  openings: number
  minExperienceYears: number
  maxExperienceYears: number
  salaryMin: number
  salaryMax: number
}

const toApiBody = (body: CreateJobDescriptionFormValues): JobDescriptionBody => ({
  ...body,
  employmentType: Number(body.employmentType),
  status: Number(body.status),
  openings: Number(body.openings),
  minExperienceYears: Number(body.minExperienceYears),
  maxExperienceYears: Number(body.maxExperienceYears),
  salaryMin: Number(body.salaryMin),
  salaryMax: Number(body.salaryMax)
})

class JobDescriptionService extends BaseService {
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
    const { data } = await this.get<BasePaginationResponse<JobDescription>>(`/v1/${this.baseUrl}`, {
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
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, toApiBody(body))
    return data.value
  }

  getJobDescription = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<JobDescriptionDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  updateJobDescription = async ({ id, body }: { id: string; body: CreateJobDescriptionFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, toApiBody(body))

    return data.value
  }

  deleteJobDescription = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const jobDescriptionService = new JobDescriptionService()
export default jobDescriptionService
