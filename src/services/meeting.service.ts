import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { BookMeetingFormValues } from '@/features/meetings/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { ScheduleSlot } from '@/types/schedule.type'

class MeetingService {
  private readonly baseUrl = 'meetings'

  getMentorMeetings = async ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) => {
    const { data } = await api.get<BasePaginationResponse<ScheduleSlot>>(
      `/v1/${this.baseUrl}/bookings/mentor/${mentorId}`,
      {
        params: {
          activeFrom,
          activeTo
        }
      }
    )

    return data
  }

  bookMeeting = async ({ body }: { body: BookMeetingFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/bookings`, body)

    return data.value
  }
}

const meetingService = new MeetingService()
export default meetingService
