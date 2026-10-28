import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { marketingPostImageRatios } from '../image-ratios'
import type { MarketingPostCoreDetail } from '../types'
import { selectMarketingChannelsSchema, type SelectMarketingChannelsFormValues } from '../validations'
import { useGetMarketingPostDetail } from './use-get-marketing-post-detail'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

// Mặc định 1:1 để ảnh nào cũng ra được ít nhất một bản, admin đổi lại tuỳ ý.
// Studio sinh lỗi và đẩy về đây thì dựng lại đúng lựa chọn lần trước, khỏi chọn lại từ đầu.
const toFormValues = (
  marketingPost: MarketingPostCoreDetail,
  selection?: SelectMarketingChannelsFormValues
): SelectMarketingChannelsFormValues => ({
  channels: selection?.channels ?? [],
  templates: selection?.templates ?? {},
  images: [...marketingPost.baseImages]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      ratios: selection?.images.find((item) => item.id === image.id)?.ratios ?? [marketingPostImageRatios[0]]
    }))
})

// Bước 2: bài gốc đã lưu rồi, giờ chốt tỉ lệ ảnh và chọn nền tảng.
export const useSelectMarketingChannels = (postId?: string) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTenantTranslation()
  const { marketingPost, isGettingMarketingPost } = useGetMarketingPostDetail(postId)
  const selection = (location.state as { selection?: SelectMarketingChannelsFormValues } | null)?.selection

  const methods = useForm<SelectMarketingChannelsFormValues>({
    defaultValues: { channels: [], images: [], templates: {} },
    values: marketingPost ? toFormValues(marketingPost, selection) : undefined,
    resolver: zodResolver(selectMarketingChannelsSchema(t))
  })

  // Không gọi AI ở đây. Một lượt sinh mất tới ba phút, bắt admin ngồi lại trang chọn nền tảng
  // để chờ là phí. Đẩy lựa chọn sang Studio rồi chạy ở đó - trang đó không rời đi nên tiến độ,
  // khoá nút và đọc lại kết quả gom về một chỗ.
  const onSubmit: SubmitHandler<SelectMarketingChannelsFormValues> = (values) => {
    if (!postId) return

    navigate(`${POSTS_PATH}/studio/${postId}`, { state: { generate: values } })
  }

  return { marketingPost, isGettingMarketingPost, methods, onSubmit }
}
