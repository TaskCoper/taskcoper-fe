import { useQuery } from '@tanstack/react-query'
import { publicationKeys } from '../query-keys'
import publicationService from '../services'

// Mỗi lần đọc là một lượt gọi sang Meta, nên giữ cache mặc định chứ không đọc lại liên tục.
// Lỗi (thiếu quyền, nền tảng chưa hỗ trợ) hiện ngay trong khối chỉ số, không đẩy cả trang sang màn lỗi.
export const useGetPublicationInsights = ({ publicationId }: { publicationId?: string }) => {
  const {
    data: insights,
    error: insightsError,
    isLoading: isGettingInsights,
    isFetching: isRefreshingInsights,
    refetch: refetchInsights
  } = useQuery({
    queryKey: publicationKeys.insights(publicationId ?? ''),
    queryFn: () => publicationService.getPublicationInsights({ publicationId: publicationId as string }),
    enabled: Boolean(publicationId),
    retry: false,
    throwOnError: false
  })

  return { insights, insightsError, isGettingInsights, isRefreshingInsights, refetchInsights }
}
