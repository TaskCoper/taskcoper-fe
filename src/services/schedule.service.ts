import type { GetMySchedulesParams } from '@/features/schedules/hooks/use-get-my-schedules'
import type { CreateSchedulesFormValues, UpdateScheduleFormValues } from '@/features/schedules/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MeetingRule } from '@/types/schedule.type'

class ScheduleService {
  private readonly baseUrl = 'meeting-rules'

  createSchedules = async ({ body }: { body: CreateSchedulesFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/batch`, body)

    return data.value
  }

  getMySchedules = async ({ isActive }: GetMySchedulesParams) => {
    const { data } = await api.get<BasePaginationResponse<MeetingRule>>(`/v1/${this.baseUrl}/me`, {
      params: {
        isActive
      }
    })

    return data
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
