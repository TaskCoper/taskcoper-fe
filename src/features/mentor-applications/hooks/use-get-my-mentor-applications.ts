import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorApplicationService from '../services'
import type { Application, ApplicationStatus } from '../types'

export interface GetMyMentorApplicationsParams {
  status?: ApplicationStatus
  sortBy?: '-createdat' | 'createdat'
}

export const useGetMyMentorApplications = ({ status, sortBy }: GetMyMentorApplicationsParams = {}) => {
  const { data: applications = getDefaultPaginationResponse<Application>(), isLoading: isLoadingMyMentorApplications } =
    useQuery({
      queryKey: queryKeys.mentorApplications.my({ status, sortBy }),
      queryFn: () => mentorApplicationService.getMyMentorApplications({ status, sortBy })
    })

  return { applications, isLoadingMyMentorApplications }
}
