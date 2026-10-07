import { useQuery } from '@tanstack/react-query'
import type { MarketingPostPlatform } from '../../types'
import { publicationKeys } from '../query-keys'
import publicationService from '../services'

// Revision là hash của bản chốt tại đúng thời điểm đọc. Cache lại thì admin dễ bấm đăng bằng
// một hash đã cũ rồi ăn 409, nên luôn coi là stale và đọc lại mỗi lần mở.
export const useGetPublicationPreview = ({
  id,
  platform,
  accountId
}: {
  id?: string
  platform: MarketingPostPlatform
  accountId?: string
}) => {
  const {
    data: preview,
    isFetching: isGettingPreview,
    error: previewError,
    refetch: refetchPreview
  } = useQuery({
    queryKey: publicationKeys.preview(id ?? '', platform, accountId ?? ''),
    queryFn: () =>
      publicationService.getPublicationPreview({ id: id as string, platform, accountId: accountId as string }),
    enabled: Boolean(id && accountId),
    staleTime: 0,
    // Kênh chưa bật hoặc account hỏng là chuyện hiện tại chỗ, đừng đẩy cả trang sang màn lỗi
    throwOnError: false
  })

  return { preview, isGettingPreview, previewError, refetchPreview }
}
