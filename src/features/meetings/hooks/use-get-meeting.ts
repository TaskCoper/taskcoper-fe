import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { useQuery } from '@tanstack/react-query'

export const useGetMeeting = ({ meetingId }: { meetingId?: string }) => {
  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: queryKeys.meetings.detail(meetingId),
    queryFn: () => meetingService.getMeeting({ meetingId }),
    enabled: !!meetingId
  })

  return { meeting, isLoadingMeeting }
}
