import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { MarketingPostPlatform } from '../../types'
import { publicationKeys } from '../query-keys'
import publicationService from '../services'
import { isActivePublication, isBlockingPublication, PublicationStatus, type PublicationJob } from '../types'

const DEFAULT_PAGE_SIZE = 20

export const useGetPublications = ({
  id,
  platform,
  pageIndex = 1,
  pageSize = DEFAULT_PAGE_SIZE
}: {
  id?: string
  platform: MarketingPostPlatform
  pageIndex?: number
  pageSize?: number
}) => {
  const params = { pageIndex, pageSize }

  const { data: page, isLoading: isGettingPublications } = useQuery({
    queryKey: publicationKeys.list(id ?? '', platform, params),
    queryFn: () => publicationService.getPublications({ id: id as string, platform, ...params }),
    enabled: Boolean(id),
    throwOnError: false
  })

  const jobs = useMemo(() => page?.items ?? [], [page])

  // Mỗi PlatformPost chỉ được có một job hoạt động, nên tìm thấy cái nào là cái đó.
  // GIẢ ĐỊNH: backend trả lịch sử mới-trước. Contract mốc 12 chỉ nói phân trang 1-based chứ
  // không nói thứ tự; nếu hoá ra là cũ-trước thì một bài có hơn `pageSize` lượt đăng sẽ không
  // thấy job hoạt động ở trang đầu và panel sẽ mời đăng lại - phải đổi sang đọc theo trang cuối
  // hoặc xin backend một endpoint trả job hoạt động.
  const activeJob = useMemo<PublicationJob | undefined>(
    () => jobs.find((job) => isActivePublication(job.status)),
    [jobs]
  )

  // Không có job hoạt động nhưng đã Succeeded/Closed thì vẫn không được tạo yêu cầu đăng mới:
  // đăng lại một bài đã đăng nằm ngoài phạm vi mốc 12-14.
  const blockingJob = useMemo<PublicationJob | undefined>(
    () => activeJob ?? jobs.find((job) => isBlockingPublication(job.status)),
    [jobs, activeJob]
  )

  // Không còn job nào chặn mà lần gần nhất lỗi: khối đăng mở lại cho đăng lần mới, nhưng vẫn
  // phải cho admin thấy lần trước hỏng vì sao để sửa đúng chỗ. Cùng giả định mới-trước như trên.
  const lastFailedJob = useMemo<PublicationJob | undefined>(
    () => (!blockingJob && jobs[0]?.status === PublicationStatus.Failed ? jobs[0] : undefined),
    [jobs, blockingJob]
  )

  return {
    publications: jobs,
    lastFailedJob,
    activeJob,
    blockingJob,
    totalCount: page?.totalCount ?? 0,
    hasNextPage: page?.hasNextPage ?? false,
    isGettingPublications
  }
}
