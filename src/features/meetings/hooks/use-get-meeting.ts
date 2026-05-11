import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import meetingService from '../services'

export const useGetMeeting = ({ meetingId, enabled = true }: { meetingId?: string; enabled?: boolean }) => {
  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: queryKeys.meetings.detail(meetingId),
    queryFn: () => meetingService.getMeeting({ meetingId }),
    enabled: !!meetingId && enabled
  })

  return { meeting, isLoadingMeeting }
}
