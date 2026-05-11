import type { Application, ApplicationStatus } from '@/features/mentor-applications/types'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorApplicationService from '../services'

export interface GetMentorApplicationsParams {
  status?: ApplicationStatus
  sortBy?: '-createdat' | 'createdat'
}

export const useGetMentorApplications = ({ status, sortBy }: GetMentorApplicationsParams = {}) => {
  const { data: applications = getDefaultPaginationResponse<Application>(), isLoading: isLoadingMentorApplications } =
    useQuery({
      queryKey: queryKeys.mentorApplications.list({ status, sortBy }),
      queryFn: () => mentorApplicationService.getMentorApplications({ status, sortBy })
    })

  return { applications, isLoadingMentorApplications }
}
