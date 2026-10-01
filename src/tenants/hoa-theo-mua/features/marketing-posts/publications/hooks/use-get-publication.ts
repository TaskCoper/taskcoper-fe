import { useQuery } from '@tanstack/react-query'
import { publicationKeys } from '../query-keys'
import publicationService from '../services'
import { SCHEDULE_LATENESS_SECONDS } from '../schedule'
import { PublicationStatus, type PublicationJob } from '../types'

const POLL_BASE_MS = 2_000
const POLL_MAX_MS = 30_000
const POLL_BACKOFF_STEPS = 10

// Chỉ những trạng thái TỰ đổi theo thời gian mới đáng poll:
// - Queued/Publishing: worker đang chạy, vài giây tới là khác.
// - Scheduled: nằm im tới giờ hẹn, poll suốt mấy ngày thì phí; chỉ bật khi đã tới hạn và còn
//   trong cửa sổ trễ, tức là lúc nó sắp nhảy sang Publishing.
// - NeedsReview/Failed/Succeeded/Cancelled/Closed: chờ người bấm, không chờ thời gian.
const shouldPoll = (job: PublicationJob) => {
  if (job.status === PublicationStatus.Queued || job.status === PublicationStatus.Publishing) return true
  if (job.status !== PublicationStatus.Scheduled || !job.scheduledAt) return false

  const due = new Date(job.scheduledAt).getTime()
  if (Number.isNaN(due)) return false

  return Date.now() >= due - POLL_MAX_MS && Date.now() <= due + SCHEDULE_LATENESS_SECONDS * 1000
}

export const useGetPublication = ({ publicationId }: { publicationId?: string }) => {
  const {
    data: detail,
    isLoading: isGettingPublication,
    refetch: refetchPublication
  } = useQuery({
    queryKey: publicationKeys.detail(publicationId ?? ''),
    queryFn: () => publicationService.getPublication({ publicationId: publicationId as string }),
    enabled: Boolean(publicationId),
    // Đang chạy thì đọc lại liên tục, nên cache cũ không có giá trị gì
    staleTime: 0,
    throwOnError: false,
    // Giãn dần: Meta có thể ngâm container cả phút, gõ cửa mỗi 2 giây suốt là vô ích.
    // `refetchIntervalInBackground` để mặc định false nên rời tab là tự dừng.
    refetchInterval: (query) => {
      const job = query.state.data?.job
      if (!job || !shouldPoll(job)) return false

      const step = Math.min(query.state.dataUpdateCount, POLL_BACKOFF_STEPS)

      return Math.min(POLL_BASE_MS * 1.5 ** step, POLL_MAX_MS)
    }
  })

  // Trả thẳng job ra ngoài: chỗ gọi cần đúng một `PublicationJob` để hiện trạng thái, còn
  // snapshot/attempts/reviews thì lấy qua `detail` khi nào có màn đối soát cần tới.
  return { publication: detail?.job, detail, isGettingPublication, refetchPublication }
}
