import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { getApiErrorDetail } from '../../api-error'
import { marketingPostKeys } from '../../query-keys'
import type { MarketingPostPlatform } from '../../types'
import { getPublicationErrorKey, parsePublicationErrorCode } from '../error-codes'
import { clearIdempotencyKey, getIdempotencyKey } from '../idempotency'
import { publicationKeys } from '../query-keys'
import publicationService from '../services'
import { toScheduleIso } from '../schedule'
import { PublicationStatus, type PublicationJob, type PublicationResolveAction } from '../types'

type PublicationError = AxiosError<ErrorResponse>

export const usePublicationActions = ({ id, platform }: { id?: string; platform: MarketingPostPlatform }) => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const invalidateJobs = useCallback(
    (job?: PublicationJob) => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.lists() })
      if (job) queryClient.invalidateQueries({ queryKey: publicationKeys.detail(job.publicationId) })
      // Job đổi trạng thái thì `PlatformPost.status` trong detail bài cũng đổi theo
      if (id) queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(id) })
    },
    [queryClient, id]
  )

  // Preview mang hash của bản chốt; job vừa đổi nghĩa là khoá sửa cũng đổi, hash cũ hết giá trị
  const invalidatePreviews = useCallback(
    () => queryClient.invalidateQueries({ queryKey: publicationKeys.previews() }),
    [queryClient]
  )

  const onError = useCallback(
    (error: PublicationError) => {
      const messageCode = error.response?.data?.messageCode
      const key = messageCode ? getPublicationErrorKey(parsePublicationErrorCode(messageCode).baseCode) : null

      toast.error(t('marketingPosts.publication.error.title'), {
        description: key ? t(`marketingPosts.publication.error.${key}`) : getApiErrorDetail(error)
      })

      // 409 luôn nghĩa là trạng thái phía server đã khác. Đọc lại rồi mới cho bấm tiếp - tuyệt
      // đối không tự đổi idempotency key hay lặp lệnh để vượt conflict.
      if (error.response?.status === 409) {
        invalidateJobs()
        invalidatePreviews()
      }
    },
    [t, invalidateJobs, invalidatePreviews]
  )

  // 202 mới là "đã nhận yêu cầu". Nói "đã đăng" ở đây là sai - bài có thể còn hỏng ở bước media.
  const onJobAccepted = useCallback(
    (job: PublicationJob, messageKey: string) => {
      invalidateJobs(job)
      invalidatePreviews()
      toast.success(t(messageKey))
    },
    [invalidateJobs, invalidatePreviews, t]
  )

  const { mutate: publishPost, isPending: isPublishing } = useMutation({
    mutationFn: ({ accountId, revision }: { accountId: string; revision: string }) =>
      publicationService.publishPlatformPost({
        id: id as string,
        platform,
        body: {
          accountId,
          idempotencyKey: getIdempotencyKey({ postId: id as string, platform, accountId, revision }),
          expectedRevision: revision
        }
      }),
    onSuccess: (job, { accountId, revision }) => {
      clearIdempotencyKey({ postId: id as string, platform, accountId, revision })
      onJobAccepted(job, 'marketingPosts.publication.toast.publishAccepted')
    },
    onError
  })

  const { mutate: schedulePost, isPending: isScheduling } = useMutation({
    mutationFn: ({
      accountId,
      revision,
      scheduledAt
    }: {
      accountId: string
      revision: string
      // Chuỗi `datetime-local` từ picker; đổi sang ISO có offset ngay tại đây để mọi nơi gọi
      // đều không thể quên bước đó.
      scheduledAt: string
    }) => {
      const iso = toScheduleIso(scheduledAt)
      if (!iso) return Promise.reject(new Error('invalid schedule'))

      return publicationService.schedulePlatformPost({
        id: id as string,
        platform,
        body: {
          accountId,
          idempotencyKey: getIdempotencyKey({ postId: id as string, platform, accountId, revision, scheduledAt: iso }),
          expectedRevision: revision,
          scheduledAt: iso
        }
      })
    },
    onSuccess: (job, { accountId, revision, scheduledAt }) => {
      clearIdempotencyKey({
        postId: id as string,
        platform,
        accountId,
        revision,
        scheduledAt: toScheduleIso(scheduledAt)
      })
      onJobAccepted(job, 'marketingPosts.publication.toast.scheduleAccepted')
    },
    onError
  })

  const { mutate: reschedulePost, isPending: isRescheduling } = useMutation({
    mutationFn: ({
      publicationId,
      expectedRevision,
      scheduledAt
    }: {
      publicationId: string
      expectedRevision: number
      scheduledAt: string
    }) => {
      const iso = toScheduleIso(scheduledAt)
      if (!iso) return Promise.reject(new Error('invalid schedule'))

      return publicationService.reschedulePlatformPost({
        id: id as string,
        platform,
        body: { publicationId, expectedRevision, scheduledAt: iso }
      })
    },
    onSuccess: (job) => onJobAccepted(job, 'marketingPosts.publication.toast.rescheduled'),
    onError
  })

  const { mutate: cancelSchedule, isPending: isCancellingSchedule } = useMutation({
    mutationFn: ({ publicationId, expectedRevision }: { publicationId: string; expectedRevision: number }) =>
      publicationService.cancelSchedule({ id: id as string, platform, publicationId, expectedRevision }),
    onSuccess: (job) => onJobAccepted(job, 'marketingPosts.publication.toast.scheduleCancelled'),
    onError
  })

  const { mutate: retryPublication, isPending: isRetrying } = useMutation({
    mutationFn: ({ publicationId, expectedRevision }: { publicationId: string; expectedRevision: number }) =>
      publicationService.retryPublication({ publicationId, body: { expectedRevision } }),
    onSuccess: (job) => onJobAccepted(job, 'marketingPosts.publication.toast.retryAccepted'),
    onError
  })

  const { mutate: cancelPublication, isPending: isCancelling } = useMutation({
    mutationFn: ({ publicationId, expectedRevision }: { publicationId: string; expectedRevision: number }) =>
      publicationService.cancelPublication({ publicationId, body: { expectedRevision } }),
    onSuccess: (job) => onJobAccepted(job, 'marketingPosts.publication.toast.cancelled'),
    onError
  })

  const { mutate: recheckPublication, isPending: isRechecking } = useMutation({
    mutationFn: ({ publicationId, expectedRevision }: { publicationId: string; expectedRevision: number }) =>
      publicationService.recheckPublication({ publicationId, body: { expectedRevision } }),
    onSuccess: (job) => {
      invalidateJobs(job)

      // Đối soát không tìm ra bài KHÔNG có nghĩa là chưa đăng. Chỉ báo trạng thái hiện tại.
      toast.info(t('marketingPosts.publication.toast.rechecked'), {
        description: t(`marketingPosts.publication.status.${job.status}`)
      })
    },
    onError
  })

  const { mutate: resolvePublication, isPending: isResolving } = useMutation({
    mutationFn: ({
      publicationId,
      expectedRevision,
      action,
      note,
      externalPostId
    }: {
      publicationId: string
      expectedRevision: number
      action: PublicationResolveAction
      note: string
      externalPostId?: string | null
    }) =>
      publicationService.resolvePublication({
        publicationId,
        body: { expectedRevision, action, note, externalPostId: externalPostId || null }
      }),
    onSuccess: (job) => {
      invalidateJobs(job)

      // Adapter vẫn đối chiếu lại: request trả 200 mà job còn NeedsReview là chuyện bình thường.
      // Báo "đã xác nhận thành công" ở đây sẽ là nói dối.
      if (job.status === PublicationStatus.NeedsReview) {
        toast.warning(t('marketingPosts.publication.toast.resolveStillNeedsReview'))

        return
      }

      toast.success(t('marketingPosts.publication.toast.resolved'), {
        description: t(`marketingPosts.publication.status.${job.status}`)
      })
    },
    onError
  })

  return {
    publishPost,
    schedulePost,
    reschedulePost,
    cancelSchedule,
    retryPublication,
    cancelPublication,
    recheckPublication,
    resolvePublication,
    isPublishing,
    isScheduling,
    isRescheduling,
    isCancellingSchedule,
    isRetrying,
    isCancelling,
    isRechecking,
    isResolving,
    isBusy:
      isPublishing ||
      isScheduling ||
      isRescheduling ||
      isCancellingSchedule ||
      isRetrying ||
      isCancelling ||
      isRechecking ||
      isResolving
  }
}
