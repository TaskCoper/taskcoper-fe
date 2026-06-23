import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { GetMentorPackageBookingsParams } from './hooks/use-get-mentor-package-bookings'
import type { GetMentorPackageStatisticsParams } from './hooks/use-get-mentor-package-statistics'
import type { GetMentorPackagesParams } from './hooks/use-get-mentor-packages'
import type { GetMentorPackagesStatisticsParams } from './hooks/use-get-mentor-packages-statistics'
import type { GetMyMentorPackagesParams } from './hooks/use-get-my-mentor-packages'
import type { GetPurchasedMentorPackagesParams } from './hooks/use-get-purchased-mentor-packages'
import type {
  MentorPackage,
  MentorPackageBooking,
  MentorPackageDetail,
  MentorPackagePinStatistic,
  MentorPackagesStatistics,
  MentorPackageStatistics,
  PurchasedMentorPackage
} from './types'
import type { CreateMentorPackageFormValues, UpdateMentorPackageFormValues } from './validations'

class MentorPackageService extends BaseService {
  private readonly baseUrl = 'mentor-packages'

  createMentorPackage = async ({ body }: { body: CreateMentorPackageFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorPackages = async ({ searchTerm, pageIndex, pageSize, sortBy, isPin }: GetMyMentorPackagesParams) => {
    const { data } = await this.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/me`, {
      params: { searchTerm, pageIndex, pageSize, sortBy, isPin }
    })

    return data
  }

  getMentorPackages = async ({ mentorId, isPin }: GetMentorPackagesParams) => {
    if (!mentorId) return getDefaultPaginationResponse<MentorPackage>()
    const { data } = await this.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/mentor/${mentorId}`, {
      params: { isPin }
    })

    return data
  }

  getPurchasedMentorPackages = async ({ mode, isNeedFeedback }: GetPurchasedMentorPackagesParams) => {
    const { data } = await this.get<BasePaginationResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me`, {
      params: { mode, isNeedFeedback }
    })

    return data
  }

  getPurchasedMentorPackage = async ({ packageId }: { packageId?: string }) => {
    if (!packageId) return null
    const { data } = await this.get<BaseResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me/${packageId}`)

    return data.value
  }

  getProjectPurchasedMentorPackages = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<PurchasedMentorPackage>()
    const { data } = await this.get<BasePaginationResponse<PurchasedMentorPackage>>(
      `/v1/${this.baseUrl}/projects/${projectIdentifier}`
    )

    return data
  }

  getMentorPackage = async ({ packageId }: { packageId?: string }) => {
    if (!packageId) return null
    const { data } = await this.get<BaseResponse<MentorPackageDetail>>(`/v1/${this.baseUrl}/${packageId}`)

    return data.value
  }

  updateMentorPackage = async ({ body }: { body: UpdateMentorPackageFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  deleteMentorPackage = async ({ mentorPackageId }: { mentorPackageId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${mentorPackageId}`)

    return data.value
  }

  getMentorPackageStatistics = async ({ mentorPackageId, startTime, endTime }: GetMentorPackageStatisticsParams) => {
    if (!mentorPackageId) return null
    const { data } = await this.get<BaseResponse<MentorPackageStatistics>>(
      `/v1/${this.baseUrl}/${mentorPackageId}/statistics`,
      { params: { startTime, endTime } }
    )

    return data.value
  }

  getMentorPackagePinStatistics = async () => {
    const { data } = await this.get<BasePaginationResponse<MentorPackagePinStatistic>>(
      `/v1/${this.baseUrl}/pin/statistic`
    )

    return data
  }

  getMentorPackageBookings = async ({
    mentorPackageId,
    status,
    pageIndex,
    pageSize,
    sortBy
  }: GetMentorPackageBookingsParams) => {
    if (!mentorPackageId) return getDefaultPaginationResponse<MentorPackageBooking>()
    const { data } = await this.get<BasePaginationResponse<MentorPackageBooking>>(
      `/v1/${this.baseUrl}/${mentorPackageId}/bookings`,
      { params: { status, pageIndex, pageSize, sortBy } }
    )

    return data
  }

  getMentorPackagesStatistics = async ({ startTime, endTime }: GetMentorPackagesStatisticsParams) => {
    const { data } = await this.get<BaseResponse<MentorPackagesStatistics>>(`/v1/${this.baseUrl}/me/statistics`, {
      params: { startTime, endTime }
    })

    return data.value
  }
}

const mentorPackageService = new MentorPackageService()
export default mentorPackageService
