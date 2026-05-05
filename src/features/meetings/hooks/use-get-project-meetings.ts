import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export interface GetProjectMeetingsParams {
  projectIdentifier?: string
  activeFrom: string
  activeTo: string
  status?: string[]
}

export const useGetProjectMeetings = ({
  projectIdentifier,
  activeFrom,
  activeTo,
  status
}: GetProjectMeetingsParams) => {
  const { data: projectMeetings = [], isLoading: isLoadingProjectMeetings } = useQuery({
    queryKey: queryKeys.meetings.project({ projectIdentifier, activeFrom, activeTo, status }),
    queryFn: () => meetingService.getProjectMeetings({ projectIdentifier, activeFrom, activeTo, status }),
    placeholderData: keepPreviousData,
    enabled: !!projectIdentifier && !!activeFrom && !!activeTo
  })

  return { projectMeetings, isLoadingProjectMeetings }
}
