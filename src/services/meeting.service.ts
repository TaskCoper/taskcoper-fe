import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from '@/features/meetings/hooks/use-get-my-meetings'
import type { BookMeetingFormValues } from '@/features/meetings/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MeetingBooking } from '@/types/meeting.type'
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

  getMyMeetings = async ({ activeFrom, activeTo }: GetMyMeetingsParams) => {
    const { data } = await api.get<BasePaginationResponse<MeetingBooking>>(`/v1/${this.baseUrl}/bookings/mentors/me`, {
      params: {
        activeFrom,
        activeTo
      }
    })

    return data.value.items
  }
}

const meetingService = new MeetingService()
export default meetingService
