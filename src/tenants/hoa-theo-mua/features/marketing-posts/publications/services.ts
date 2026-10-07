import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { MarketingPostPlatform } from '../types'
import type {
  GetPublicationsParams,
  PublicationDetail,
  PublicationInsights,
  PublicationJob,
  PublicationPreview,
  PublicationRevisionBody,
  PublishPublicationBody,
  ReschedulePublicationBody,
  ResolvePublicationBody,
  SchedulePublicationBody
} from './types'

interface PlatformScope {
  id: string
  platform: MarketingPostPlatform
}

// GET detail bọc job vào khoá `job`, còn GET danh sách trả job phẳng. Các endpoint thao tác
// (publish/schedule/retry/cancel/recheck/resolve) chưa đo được kiểu nào vì gọi thử là đăng bài
// thật, nên nhận cả hai: đọc nhầm một cấp là giao diện in ra khoá i18n thay vì trạng thái.
const toPublicationJob = (value: PublicationJob | { job: PublicationJob }): PublicationJob =>
  'job' in value ? value.job : value

class PublicationService extends BaseService {
  private readonly postsUrl = 'posts'
  private readonly jobsUrl = 'post-gen/publications'

  private platformUrl = (id: string, platform: MarketingPostPlatform) =>
    `/v1/${this.postsUrl}/${id}/platforms/${platform}`

  // --- Mốc 12: preview và tạo job -------------------------------------------------------------

  // Không gọi provider: chỉ đọc bản chốt + account local + validator của adapter. `revision` trả
  // về là hash phải gửi lại nguyên văn khi publish/schedule.
  getPublicationPreview = async ({ id, platform, accountId }: PlatformScope & { accountId: string }) => {
    const { data } = await this.get<BaseResponse<PublicationPreview>>(
      `${this.platformUrl(id, platform)}/publication-preview`,
      { params: { accountId } }
    )

    return data.value
  }

  // HTTP 202 - mới chỉ là nhận tác vụ, chưa phải đăng xong. Phải theo dõi job bằng detail.
  publishPlatformPost = async ({ id, platform, body }: PlatformScope & { body: PublishPublicationBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, PublishPublicationBody>(
      `${this.platformUrl(id, platform)}/publish`,
      body
    )

    return toPublicationJob(data.value)
  }

  getPublications = async ({ id, platform, pageIndex, pageSize }: PlatformScope & GetPublicationsParams) => {
    const { data } = await this.get<BasePaginationResponse<PublicationJob>>(
      `${this.platformUrl(id, platform)}/publications`,
      { params: { pageIndex, pageSize } }
    )

    return data.value
  }

  // Đọc được cả sau khi bài gốc bị xoá mềm - lịch sử đăng là bằng chứng, không mất theo bài
  getPublication = async ({ publicationId }: { publicationId: string }) => {
    const { data } = await this.get<BaseResponse<PublicationDetail>>(`/v1/${this.jobsUrl}/${publicationId}`)

    return data.value
  }

  // Đọc thẳng từ Meta mỗi lần gọi. Tài khoản thiếu quyền đọc chỉ số thì trả 409
  // `INSIGHTS_PERMISSION_REQUIRED`, phải kết nối lại tài khoản chứ thử lại không ăn thua.
  getPublicationInsights = async ({ publicationId }: { publicationId: string }) => {
    const { data } = await this.get<BaseResponse<PublicationInsights>>(`/v1/${this.jobsUrl}/${publicationId}/insights`)

    return data.value
  }

  // --- Mốc 12: thao tác trên job --------------------------------------------------------------
  // Bốn API dưới đây dùng `expectedRevision` SỐ của job, không phải hash của preview.

  // Chạy lại với ĐÚNG snapshot cũ. Muốn đổi nội dung/ảnh thì phải tạo job mới từ preview mới.
  retryPublication = async ({ publicationId, body }: { publicationId: string; body: PublicationRevisionBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, PublicationRevisionBody>(
      `/v1/${this.jobsUrl}/${publicationId}/retry`,
      body
    )

    return toPublicationJob(data.value)
  }

  // Chỉ được khi worker chưa claim; claim rồi thì trả 409
  cancelPublication = async ({ publicationId, body }: { publicationId: string; body: PublicationRevisionBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, PublicationRevisionBody>(
      `/v1/${this.jobsUrl}/${publicationId}/cancel`,
      body
    )

    return toPublicationJob(data.value)
  }

  // Đối soát lại với provider, KHÔNG đăng. Không tìm thấy bài không đủ để kết luận là chưa đăng.
  recheckPublication = async ({ publicationId, body }: { publicationId: string; body: PublicationRevisionBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, PublicationRevisionBody>(
      `/v1/${this.jobsUrl}/${publicationId}/recheck`,
      body
    )

    return toPublicationJob(data.value)
  }

  // Xác nhận của Admin vẫn bị adapter đối chiếu lại: response 200 có thể vẫn là NeedsReview.
  resolvePublication = async ({ publicationId, body }: { publicationId: string; body: ResolvePublicationBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, ResolvePublicationBody>(
      `/v1/${this.jobsUrl}/${publicationId}/resolve`,
      body
    )

    return toPublicationJob(data.value)
  }

  // --- Mốc 14: lịch đăng ----------------------------------------------------------------------

  schedulePlatformPost = async ({ id, platform, body }: PlatformScope & { body: SchedulePublicationBody }) => {
    const { data } = await this.post<BaseResponse<PublicationJob>, SchedulePublicationBody>(
      `${this.platformUrl(id, platform)}/schedule`,
      body
    )

    return toPublicationJob(data.value)
  }

  // Chỉ đổi giờ. Nội dung/ảnh/account giữ nguyên snapshot cũ.
  reschedulePlatformPost = async ({ id, platform, body }: PlatformScope & { body: ReschedulePublicationBody }) => {
    const { data } = await this.put<BaseResponse<PublicationJob>, ReschedulePublicationBody>(
      `${this.platformUrl(id, platform)}/schedule`,
      body
    )

    return toPublicationJob(data.value)
  }

  // DELETE dùng query string, không có body
  cancelSchedule = async ({
    id,
    platform,
    publicationId,
    expectedRevision
  }: PlatformScope & { publicationId: string; expectedRevision: number }) => {
    const { data } = await this.delete<BaseResponse<PublicationJob>>(`${this.platformUrl(id, platform)}/schedule`, {
      params: { publicationId, expectedRevision }
    })

    return toPublicationJob(data.value)
  }
}

const publicationService = new PublicationService()
export default publicationService
