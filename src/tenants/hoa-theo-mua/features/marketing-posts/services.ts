import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type {
  GenerateMarketingPostBody,
  GetMarketingPostsParams,
  MarketingPostContentHistory,
  MarketingPostCoreDetail,
  MarketingPostImageHistory,
  MarketingPostImageSlot,
  MarketingPostImageVersion,
  MarketingPostOfficial,
  MarketingPostPlatform,
  MarketingPostListItem,
  RegenerateMarketingContentBody,
  RegenerateMarketingImageBody,
  SaveMarketingPostBody,
  SelectMarketingContentBody,
  UpdateMarketingContentBody,
  UpdateMarketingPlatformImagesBody
} from './types'

// Backend chạy sinh nội dung + ảnh đồng bộ, riêng ngân sách AI đã 180 giây
const GENERATE_TIMEOUT_MS = 240_000

class MarketingPostService extends BaseService {
  private readonly baseUrl = 'posts'

  getMarketingPosts = async ({
    pageIndex,
    pageSize,
    keyword,
    platform,
    status,
    publishFrom,
    publishTo
  }: GetMarketingPostsParams) => {
    const { data } = await this.get<BasePaginationResponse<MarketingPostListItem>>(`/v1/${this.baseUrl}`, {
      params: { pageIndex, pageSize, keyword, platform, status, publishFrom, publishTo }
    })

    return data.value
  }

  getMarketingPost = async ({ id }: { id: string }) => {
    const { data } = await this.get<BaseResponse<MarketingPostCoreDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  createMarketingPost = async ({ body }: { body: SaveMarketingPostBody }) => {
    const { data } = await this.post<BaseResponse<MarketingPostCoreDetail>, SaveMarketingPostBody>(
      `/v1/${this.baseUrl}`,
      body
    )

    return data.value
  }

  // PUT thay toàn bộ nội dung và tập ảnh nguồn, nên body phải gửi đủ cả những thứ muốn giữ
  updateMarketingPost = async ({ id, body }: { id: string; body: SaveMarketingPostBody }) => {
    const { data } = await this.put<BaseResponse<MarketingPostCoreDetail>, SaveMarketingPostBody>(
      `/v1/${this.baseUrl}/${id}`,
      body
    )

    return data.value
  }

  // Sinh nội dung và ảnh cho các nền tảng đã chọn. Backend chạy đồng bộ, ngân sách AI 180 giây
  // cộng thời gian ghi DB - client phải chờ lâu hơn 190 giây, đừng để axios tự cắt.
  generateMarketingPost = async ({ id, body }: { id: string; body: GenerateMarketingPostBody }) => {
    const { data } = await this.post<BaseResponse<MarketingPostCoreDetail>, GenerateMarketingPostBody>(
      `/v1/${this.baseUrl}/${id}/generate`,
      body,
      { timeout: GENERATE_TIMEOUT_MS }
    )

    return data.value
  }

  // --- Mốc 5: version nội dung của một nền tảng ---
  // Ba API ghi đều trả về PostCoreDetail như GET chi tiết, nên nơi gọi cập nhật thẳng vào cache.

  private contentUrl = (id: string, platform: MarketingPostPlatform) =>
    `/v1/${this.baseUrl}/${id}/platforms/${platform}/content`

  regenerateMarketingContent = async ({
    id,
    platform,
    body
  }: {
    id: string
    platform: MarketingPostPlatform
    body: RegenerateMarketingContentBody
  }) => {
    const { data } = await this.post<BaseResponse<MarketingPostCoreDetail>, RegenerateMarketingContentBody>(
      `${this.contentUrl(id, platform)}/regenerate`,
      body,
      { timeout: GENERATE_TIMEOUT_MS }
    )

    return data.value
  }

  updateMarketingContent = async ({
    id,
    platform,
    body
  }: {
    id: string
    platform: MarketingPostPlatform
    body: UpdateMarketingContentBody
  }) => {
    const { data } = await this.put<BaseResponse<MarketingPostCoreDetail>, UpdateMarketingContentBody>(
      this.contentUrl(id, platform),
      body
    )

    return data.value
  }

  getMarketingContentVersions = async ({ id, platform }: { id: string; platform: MarketingPostPlatform }) => {
    const { data } = await this.get<BaseResponse<MarketingPostContentHistory>>(
      `${this.contentUrl(id, platform)}/versions`
    )

    return data.value
  }

  selectMarketingContent = async ({
    id,
    platform,
    generationId
  }: {
    id: string
    platform: MarketingPostPlatform
    generationId: string
  }) => {
    const { data } = await this.put<BaseResponse<MarketingPostCoreDetail>, SelectMarketingContentBody>(
      `${this.contentUrl(id, platform)}/official`,
      { generationId }
    )

    return data.value
  }

  // --- Mốc 6: version ảnh ---

  // Chỉ đẻ thêm một bản vào kho, không tự đổi ảnh đang chốt - muốn dùng phải gọi tiếp
  // updateMarketingPlatformImages.
  regenerateMarketingImage = async ({ id, body }: { id: string; body: RegenerateMarketingImageBody }) => {
    const { data } = await this.post<BaseResponse<MarketingPostImageVersion>, RegenerateMarketingImageBody>(
      `/v1/${this.baseUrl}/${id}/images/regenerate`,
      body,
      { timeout: GENERATE_TIMEOUT_MS }
    )

    return data.value
  }

  getMarketingImageHistory = async ({ id }: { id: string }) => {
    const { data } = await this.get<BaseResponse<MarketingPostImageHistory>>(`/v1/${this.baseUrl}/${id}/images`)

    return data.value
  }

  // Thay toàn bộ tập ô ảnh của một nền tảng: phải gửi cả những ô muốn giữ
  updateMarketingPlatformImages = async ({
    id,
    platform,
    images
  }: {
    id: string
    platform: MarketingPostPlatform
    images: MarketingPostImageSlot[]
  }) => {
    const { data } = await this.put<BaseResponse<MarketingPostCoreDetail>, UpdateMarketingPlatformImagesBody>(
      `/v1/${this.baseUrl}/${id}/platforms/${platform}/images`,
      { images }
    )

    return data.value
  }

  // --- Mốc 7: bản chốt ---

  getMarketingPostOfficial = async ({ id, platform }: { id: string; platform: MarketingPostPlatform }) => {
    const { data } = await this.get<BaseResponse<MarketingPostOfficial>>(
      `/v1/${this.baseUrl}/${id}/platforms/${platform}/official`
    )

    return data.value
  }

  deleteMarketingPost = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<{ basePostId: string; isDeleted: boolean }>>(
      `/v1/${this.baseUrl}/${id}`
    )

    return data.value
  }
}

const marketingPostService = new MarketingPostService()
export default marketingPostService
