import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export interface GetMyMeetingsParams {
  activeFrom: string
  activeTo: string
  packageBookingIds: string[]
  mode?: number[]
  // 0: mentor
  // 1: mentee
}

export const useGetMyMeetings = ({ activeFrom, activeTo, packageBookingIds, mode }: GetMyMeetingsParams) => {
  const { data: myMeetings = [], isLoading: isLoadingMyMeetings } = useQuery({
    queryKey: queryKeys.meetings.my({ activeFrom, activeTo, packageBookingIds, mode }),
    queryFn: () => meetingService.getMyMeetings({ activeFrom, activeTo, packageBookingIds, mode }),
    placeholderData: keepPreviousData,
    enabled: !!activeFrom && !!activeTo
  })

  return { myMeetings, isLoadingMyMeetings }
}
