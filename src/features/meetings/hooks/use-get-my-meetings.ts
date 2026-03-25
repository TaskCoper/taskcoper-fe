import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMyMeetingsParams {
  activeFrom: string
  activeTo: string
}

export const useGetMyMeetings = ({ activeFrom, activeTo }: GetMyMeetingsParams) => {
  const { data: myMeetings = [], isLoading: isLoadingMyMeetings } = useQuery({
    queryKey: queryKeys.meetings.my({ activeFrom, activeTo }),
    queryFn: () => meetingService.getMyMeetings({ activeFrom, activeTo })
  })

  return { myMeetings, isLoadingMyMeetings }
}
