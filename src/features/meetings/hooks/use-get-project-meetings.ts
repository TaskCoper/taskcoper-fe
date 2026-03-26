import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { useQuery } from '@tanstack/react-query'

export interface GetProjectMeetingsParams {
  projectId: string
  activeFrom: string
  activeTo: string
}

export const useGetProjectMeetings = ({ projectId, activeFrom, activeTo }: GetProjectMeetingsParams) => {
  const { data: projectMeetings = [], isLoading: isLoadingProjectMeetings } = useQuery({
    queryKey: queryKeys.meetings.project({ projectId, activeFrom, activeTo }),
    queryFn: () => meetingService.getProjectMeetings({ projectId, activeFrom, activeTo }),
    enabled: !!projectId && !!activeFrom && !!activeTo
  })

  return { projectMeetings, isLoadingProjectMeetings }
}
