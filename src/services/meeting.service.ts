import type { GetMentorMeetingsParams } from '@/features/meetings/hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from '@/features/meetings/hooks/use-get-my-meetings'
import type { GetProjectMeetingsParams } from '@/features/meetings/hooks/use-get-project-meetings'
import type {
  BookMeetingFormValues,
  CancelMeetingFormValues,
  RescheduleMeetingFormValues
} from '@/features/meetings/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MeetingBooking, MeetingDetail } from '@/types/meeting.type'
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
    const { data } = await api.get<BasePaginationResponse<MeetingBooking>>(`/v1/${this.baseUrl}/bookings/me`, {
      params: {
        activeFrom,
        activeTo
      }
    })

    return data.value.items
  }

  getProjectMeetings = async ({ projectIdentifier, activeFrom, activeTo }: GetProjectMeetingsParams) => {
    const { data } = await api.get<BasePaginationResponse<MeetingBooking>>(
      `/v1/${this.baseUrl}/bookings/projects/${projectIdentifier}`,
      {
        params: {
          activeFrom,
          activeTo
        }
      }
    )

    return data.value.items
  }

  getMeeting = async ({ meetingId }: { meetingId?: string }) => {
    if (!meetingId) return null
    const { data } = await api.get<BaseResponse<MeetingDetail>>(`/v1/${this.baseUrl}/bookings/${meetingId}`)

    return data.value
  }

  cancelMeeting = async ({ meetingId, reason }: CancelMeetingFormValues) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
      data: {
        meetingId,
        reason
      }
    })

    return data.value
  }

  rescheduleMeeting = async ({ body }: { body: RescheduleMeetingFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }
}

const meetingService = new MeetingService()
export default meetingService
