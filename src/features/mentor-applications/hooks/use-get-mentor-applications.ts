import { queryKeys } from '@/lib/query-keys'
import mentorApplicationService from '@/services/mentor-application.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Application, ApplicationStatus } from '@/types/mentor-application.type'
import { useQuery } from '@tanstack/react-query'

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
