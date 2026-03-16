import { queryKeys } from '@/lib/query-keys'
import meetingService from '@/services/meeting.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMentorMeetingsParams {
  mentorId: string
  activeFrom: string
  activeTo: string
}

export const useGetMentorMeetings = ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) => {
  const { data: mentorMeetings, isLoading: isLoadingMentorMeetings } = useQuery({
    queryKey: queryKeys.meetings.mentor({ mentorId, activeFrom, activeTo }),
    queryFn: () => meetingService.getMentorMeetings({ mentorId, activeFrom, activeTo })
  })

  return { mentorMeetings, isLoadingMentorMeetings }
}
