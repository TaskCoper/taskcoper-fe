import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMySchedulesParams } from './hooks/use-get-my-schedules'
import type { GetScheduleParams } from './hooks/use-get-schedule'
import type { MeetingRule, ScheduleSlot } from './types'
import type { CreateSchedulesFormValues, UpdateScheduleFormValues } from './validations'

class ScheduleService {
  private readonly baseUrl = 'meeting-rules'

  getMySchedules = async ({ isActive }: GetMySchedulesParams) => {
    const { data } = await api.get<BasePaginationResponse<MeetingRule>>(`/v1/${this.baseUrl}/me`, {
      params: {
        isActive
      }
    })

    return data
  }

  getSchedule = async ({ userId, activeFrom, activeTo }: GetScheduleParams) => {
    const { data } = await api.get<BasePaginationResponse<ScheduleSlot>>(`/v1/${this.baseUrl}/users/${userId}`, {
      params: {
        activeFrom,
        activeTo
      }
    })

    return data
  }

  createSchedules = async ({ body }: { body: CreateSchedulesFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/batch`, body)

    return data.value
  }

  deleteSchedule = async ({ id }: { id: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  updateSchedule = async ({ id, body }: { id: string; body: UpdateScheduleFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, body)

    return data.value
  }
}

const scheduleService = new ScheduleService()
export default scheduleService
