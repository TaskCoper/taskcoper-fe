import { useQuery } from '@tanstack/react-query'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import { MarketingPostPlatformStatus } from '../types'

// Backend chạy sinh nội dung đồng bộ, nhưng người khác có thể đang chạy một lượt khác,
// hoặc chính mình vừa F5 giữa chừng. Lúc đó phải tự hỏi lại chứ không đứng im chờ mãi.
const POLL_WHILE_GENERATING_MS = 5000

const runningStatuses: MarketingPostPlatformStatus[] = [
  MarketingPostPlatformStatus.Generating,
  MarketingPostPlatformStatus.Publishing
]

export const useGetMarketingPostDetail = (id: string | undefined, { poll = false }: { poll?: boolean } = {}) => {
  const { data: marketingPost, isLoading: isGettingMarketingPost } = useQuery({
    queryKey: marketingPostKeys.detail(id ?? ''),
    queryFn: () => marketingPostService.getMarketingPost({ id: id ?? '' }),
    enabled: Boolean(id),
    // `poll` để nơi gọi bật nhịp hỏi lại ngay khi vừa bấm sinh, chưa kịp thấy trạng thái đổi
    refetchInterval: (query) =>
      poll || query.state.data?.platforms.some((platform) => runningStatuses.includes(platform.status))
        ? POLL_WHILE_GENERATING_MS
        : false,
    // Lượt AI chạy tới 3 phút nên admin gần như chắc chắn sẽ chuyển sang tab khác. Mặc định
    // React Query ngắt nhịp hỏi lại khi tab bị ẩn, mà `refetchOnWindowFocus` cả app đang tắt,
    // nên quay lại tab cũng không ai đọc lại: banner "AI đang sinh" đứng vĩnh viễn và nút chốt
    // đăng khoá theo. Nhịp này nhẹ và chỉ chạy lúc đang sinh nên cứ để nó chạy nền.
    refetchIntervalInBackground: true,
    // Bài không tồn tại là chuyện bình thường (link cũ, bài vừa bị xoá) nên tự hiện khối
    // "không tìm thấy" thay vì đẩy sang màn hình lỗi chung
    throwOnError: (error) => error.response?.status !== 404
  })

  return { marketingPost, isGettingMarketingPost }
}
