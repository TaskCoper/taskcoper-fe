import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import jobDescriptionService from '../services'
import type { JobDescription } from '../types'

export interface JobDescriptionsParams {
  page?: number
  pageSize?: number
  title?: string
  location?: string
  employmentType?: number
  status?: number
  salaryMin?: number
  salaryMax?: number
}

export const useGetJobDescriptions = ({
  page = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  title,
  location,
  status,
  employmentType,
  salaryMin,
  salaryMax
}: JobDescriptionsParams = {}) => {
  const {
    data: jobDescriptions = getDefaultPaginationResponse<JobDescription>(),
    isLoading: isLoadingJobDescriptions
  } = useQuery({
    queryKey: ['job-descriptions', page, pageSize, title, location, status, employmentType, salaryMin, salaryMax],
    queryFn: () =>
      jobDescriptionService.getJobDescriptions({
        page,
        pageSize,
        title,
        location,
        employmentType,
        status,
        salaryMin,
        salaryMax
      })
  })

  return { jobDescriptions, isLoadingJobDescriptions }
}
