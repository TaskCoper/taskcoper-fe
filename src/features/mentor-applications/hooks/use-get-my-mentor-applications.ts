import { queryKeys } from '@/lib/query-keys'
import mentorApplicationService from '@/services/mentor-application.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Application, ApplicationStatus } from '@/types/mentor-application.type'
import { useQuery } from '@tanstack/react-query'

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
