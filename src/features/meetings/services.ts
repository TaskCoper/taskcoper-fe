import type { ScheduleSlot } from '@/features/schedules/types'
import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMentorMeetingsParams } from './hooks/use-get-mentor-meetings'
import type { GetMyMeetingsParams } from './hooks/use-get-my-meetings'
import type { GetProjectMeetingsParams } from './hooks/use-get-project-meetings'
import type { MeetingBooking, MeetingDetail } from './types'
import type { BookMeetingFormValues, CancelMeetingFormValues, UpdateMeetingFormValues } from './validations'

class MeetingService extends BaseService {
  private readonly baseUrl = 'meetings'

  getMentorMeetings = async ({ mentorId, activeFrom, activeTo }: GetMentorMeetingsParams) => {
    const { data } = await this.get<BasePaginationResponse<ScheduleSlot>>(
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
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/bookings`, body)

    return data.value
  }

  getMyMeetings = async ({ activeFrom, activeTo, packageBookingIds, mode, status }: GetMyMeetingsParams) => {
    const { data } = await this.get<BasePaginationResponse<MeetingBooking>>(`/v1/${this.baseUrl}/bookings/me`, {
      params: {
        activeFrom,
        activeTo,
        packageBookingIds,
        mode,
        status
      }
    })

    return data.value.items
  }

  getProjectMeetings = async ({ projectIdentifier, activeFrom, activeTo, status }: GetProjectMeetingsParams) => {
    const { data } = await this.get<BasePaginationResponse<MeetingBooking>>(
      `/v1/${this.baseUrl}/bookings/projects/${projectIdentifier}`,
      {
        params: {
          activeFrom,
          activeTo,
          status
        }
      }
    )

    return data.value.items
  }

  getMeeting = async ({ meetingId }: { meetingId?: string }) => {
    if (!meetingId) return null
    const { data } = await this.get<BaseResponse<MeetingDetail>>(`/v1/${this.baseUrl}/bookings/${meetingId}`)

    return data.value
  }

  cancelMeeting = async ({ meetingId, reason }: CancelMeetingFormValues) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
      data: {
        meetingId,
        reason
      }
    })

    return data.value
  }

  updateMeeting = async ({ body }: { body: UpdateMeetingFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  completeMeeting = async ({ meetingId }: { meetingId: string }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/complete`, {
      meetingId
    })

    return data.value
  }
}

const meetingService = new MeetingService()
export default meetingService
