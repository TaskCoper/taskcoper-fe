import { getImageTemplates, templatePairs, type MarketingTemplateSelections } from '../image-templates'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useIsMutating, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { getApiErrorDetail } from '../api-error'
import { parseHashtags } from '../hashtags'
import { useGetMarketingPostDetail } from '../hooks/use-get-marketing-post-detail'
import { useGetMarketingPostOfficial } from '../hooks/use-get-marketing-post-official'
import { marketingPostImageRatioCodes, marketingPostRatiosByCode, type MarketingPostImageRatio } from '../image-ratios'
import { channelPlatforms, platformChannels } from '../platform-channels'
import { getPublicationErrorKey, parsePublicationErrorCode } from '../publications/error-codes'
import { publicationKeys } from '../publications/query-keys'
import {
  toBatches,
  toImagePairs,
  toRatioRequests as toBatchRatioRequests,
  type MarketingGenerateSelection
} from './generate-batches'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import {
  MarketingPostGenerateMode,
  MarketingPostImageStatus,
  MarketingPostPlatformStatus,
  isLockedForEditingStatus,
  type CreateMarketingPostImage,
  type GenerateMarketingPostBody,
  type MarketingPostChannel,
  type MarketingPostContentHistory,
  type MarketingPostCoreDetail,
  type MarketingPostImageHistory,
  type MarketingPostImageSlot,
  MarketingPostNotReadyReason,
  type MarketingPostPlatform,
  type MarketingPostRatioCode,
  type MarketingPostRatioRequest,
  type SaveMarketingPostBody
} from '../types'
import {
  MarketingStudioJobStatus,
  MarketingStudioPublishMode,
  type MarketingStudioCaptionEdit,
  type MarketingStudioCaptionJob,
  type MarketingStudioChannelDraft,
  type MarketingStudioDraft,
  type MarketingStudioImageJob,
  type MarketingStudioImageTweak,
  type MarketingStudioPoolImage,
  type MarketingStudioPublishMode as PublishMode,
  type MarketingStudioTweak
} from './types'
import { MARKETING_POST_MAX_IMAGE_PAIRS } from '../validations'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

// Gõ tới đâu lưu tới đó thì mỗi phím là một request. Chờ ngưng gõ rồi mới lưu một lần.
const CAPTION_SAVE_DELAY_MS = 1200

// Backend đang sinh dở thì nền tảng ở hai trạng thái này
const runningStatuses: MarketingPostPlatformStatus[] = [
  MarketingPostPlatformStatus.Generating,
  MarketingPostPlatformStatus.Publishing
]

// Ô ảnh định danh bằng cặp ảnh nguồn × tỉ lệ - đúng đơn vị backend gom kho ảnh,
// và là thứ không đổi qua mỗi lần cắt lại.
const toPoolImageId = (sourceBasePostImageId: string, ratioCode: string) => `${sourceBasePostImageId}-${ratioCode}`

// Form chọn theo từng ảnh, backend nhận theo từng tỉ lệ - lật lại cho đúng hợp đồng
const toRatioRequests = (entries: { baseImageId?: string; ratio: MarketingPostImageRatio }[]) => {
  const byRatio = new Map<string, MarketingPostRatioRequest>()

  entries.forEach(({ baseImageId, ratio }) => {
    if (!baseImageId) return

    const ratioCode = marketingPostImageRatioCodes[ratio]
    const existing = byRatio.get(ratioCode)

    if (existing) {
      if (!existing.basePostImageIds.includes(baseImageId)) existing.basePostImageIds.push(baseImageId)

      return
    }

    byRatio.set(ratioCode, { ratioCode, basePostImageIds: [baseImageId] })
  })

  return [...byRatio.values()]
}

const countPairs = (ratios: MarketingPostRatioRequest[]) =>
  ratios.reduce((total, ratio) => total + ratio.basePostImageIds.length, 0)

interface MarketingStudioState {
  draft: MarketingStudioDraft
  pool: MarketingStudioPoolImage[]
  channelDrafts: MarketingStudioChannelDraft[]
  imageJobs: MarketingStudioImageJob[]
  captionJobs: MarketingStudioCaptionJob[]
}

// Dựng lại toàn bộ màn Studio từ ba nguồn của backend: chi tiết bài, kho ảnh và lịch sử nội dung
// từng nền tảng. Không giữ bản sao nào trong state, tránh cảnh màn hình một đằng server một nẻo.
const toStudioState = (
  marketingPost: MarketingPostCoreDetail,
  imageHistory: MarketingPostImageHistory | undefined,
  contentHistories: Record<string, MarketingPostContentHistory | undefined>,
  getSourceName: (index: number) => string
): MarketingStudioState => {
  const baseImages = [...marketingPost.baseImages].sort((a, b) => a.sortOrder - b.sortOrder)
  const sourceIndexes = new Map(baseImages.map((image, index) => [image.id, index]))

  // Nguồn đã xoá vẫn nằm trong kho để xem lại lịch sử, nhưng không cắt lại hay chốt được nữa
  const pool = (imageHistory?.groups ?? [])
    .filter((group) => !group.sourceIsDeleted)
    .map<MarketingStudioPoolImage>((group) => {
      const sourceIndex = sourceIndexes.get(group.sourceBasePostImageId) ?? 0
      const versions = group.versions.map((version) => ({
        attempt: version.versionNo,
        // Lượt lỗi không có URL, mượn ảnh gốc để ô vẫn hiện được cái gì đó
        url: version.imageUrl ?? group.originalImageUrl,
        tweaks: [],
        note: version.feedback ?? '',
        generatedPostImageId: version.generatedPostImageId,
        isFailed: version.status === MarketingPostImageStatus.Failed,
        errorMessage: version.errorMessage
      }))
      const newest = [...versions].reverse().find((version) => !version.isFailed) ?? versions[versions.length - 1]
      const newestSource = group.versions.find((version) => version.versionNo === newest?.attempt)

      return {
        id: toPoolImageId(group.sourceBasePostImageId, group.ratioCode),
        sourceIndex,
        sourceName: getSourceName(sourceIndex),
        ratio: marketingPostRatiosByCode[group.ratioCode],
        url: newest?.url ?? group.originalImageUrl,
        width: newestSource?.pixelWidth ?? 0,
        height: newestSource?.pixelHeight ?? 0,
        sourceBasePostImageId: group.sourceBasePostImageId,
        ratioCode: group.ratioCode,
        attempt: newest?.attempt ?? 0,
        versions
      }
    })

  const attemptsByImageId = new Map(
    pool.flatMap((image) => image.versions.map((version) => [version.generatedPostImageId, version.attempt]))
  )

  const channelDrafts = marketingPost.platforms.map<MarketingStudioChannelDraft>((platform) => {
    const history = contentHistories[platform.platform]
    // Lịch sử chưa về thì tạm dựng một mục từ bản chốt trong detail, khỏi trống trơn lúc chờ
    const revisions = history
      ? history.versions.map((version) => ({
          revision: version.versionNo,
          createdAt: version.createdAt,
          caption: { title: version.title, content: version.content, hashtags: parseHashtags(version.hashtag ?? '') },
          tweaks: [] as MarketingStudioTweak[],
          note: version.feedback ?? '',
          generationId: version.generationId,
          title: version.title,
          isManual: version.source === 'Manual'
        }))
      : platform.content
        ? [
            {
              revision: platform.content.versionNo,
              createdAt: platform.content.createdAt,
              caption: {
                title: platform.content.title,
                content: platform.content.content,
                hashtags: parseHashtags(platform.content.hashtag ?? '')
              },
              tweaks: [] as MarketingStudioTweak[],
              note: '',
              generationId: platform.content.generationId,
              title: platform.content.title,
              isManual: platform.content.source === 'Manual'
            }
          ]
        : []

    const officialId = history?.officialGenerationId ?? platform.content?.generationId ?? null
    const official = revisions.find((revision) => revision.generationId === officialId)
    const slots = [...platform.images].sort((a, b) => a.sortOrder - b.sortOrder)

    return {
      channel: platformChannels[platform.platform],
      imageTemplateId: platform.imageTemplateId,
      revisions,
      activeRevision: official?.revision ?? revisions[revisions.length - 1]?.revision ?? 0,
      edits: {},
      isPinned: false,
      // Đã đăng ra ngoài thì khoá cứng; backend cũng chặn mọi thao tác sửa ở trạng thái này.
      // Đăng lỗi thì mở để sửa rồi đăng lại.
      isLocked: isLockedForEditingStatus(platform.status),
      isScheduled: platform.status === MarketingPostPlatformStatus.Scheduled,
      imageIds: slots.map((slot) => toPoolImageId(slot.sourceBasePostImageId, slot.ratioCode)),
      imageVersions: Object.fromEntries(
        slots
          .map((slot) => [
            toPoolImageId(slot.sourceBasePostImageId, slot.ratioCode),
            attemptsByImageId.get(slot.selectedGeneratedPostImageId)
          ])
          .filter((entry): entry is [string, number] => entry[1] !== undefined)
      ),
      publishMode: MarketingStudioPublishMode.Draft,
      scheduledAt: null
    }
  })

  return {
    draft: {
      id: marketingPost.basePostId,
      title: marketingPost.title,
      content: marketingPost.content,
      hashtags: parseHashtags(marketingPost.hashtag ?? ''),
      images: baseImages.map((image, index) => ({
        url: image.imageUrl,
        name: getSourceName(index),
        ratios: pool.filter((item) => item.sourceIndex === index).map((item) => item.ratio)
      })),
      channels: marketingPost.platforms.map((platform) => platformChannels[platform.platform]),
      createdAt: marketingPost.createdAt
    },
    pool,
    channelDrafts,
    // Backend chạy đồng bộ: đọc được bài nghĩa là mọi lượt đã xong, chỉ còn phản ánh kết quả
    imageJobs: pool.map((image) => ({
      id: image.id,
      kind: 'image',
      status: image.versions.every((version) => version.isFailed)
        ? MarketingStudioJobStatus.Failed
        : MarketingStudioJobStatus.Done,
      sourceIndex: image.sourceIndex,
      sourceName: image.sourceName,
      ratio: image.ratio,
      attempt: image.attempt
    })),
    captionJobs: marketingPost.platforms.map((platform) => ({
      id: `caption-${platform.platform}`,
      kind: 'caption',
      channel: platformChannels[platform.platform],
      imageTemplateId: platform.imageTemplateId,
      // `status` là của cả nền tảng: ảnh chết hết cũng thành Failed dù chữ viết xong.
      // Có content nghĩa là phần chữ xong, đừng báo hỏng oan - lỗi ảnh đã hiện ở hàng job ảnh.
      status: runningStatuses.includes(platform.status)
        ? MarketingStudioJobStatus.Running
        : platform.content
          ? MarketingStudioJobStatus.Done
          : platform.status === MarketingPostPlatformStatus.Failed
            ? MarketingStudioJobStatus.Failed
            : MarketingStudioJobStatus.Queued
    }))
  }
}

export const useMarketingStudio = ({ draftId, postId }: { draftId?: string; postId?: string }) => {
  const navigate = useNavigate()
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const id = postId ?? draftId
  // Backend ghi xong kết quả rồi vẫn giữ kết nối HTTP mở thêm cả phút. Nếu chỉ tin
  // `isPending` của mutation thì màn hình báo "đang chạy" trong khi bài đã sinh xong.
  // Nên bật nhịp hỏi lại trạng thái, và lấy trạng thái server làm mốc kết thúc.
  const [isAwaitingServer, setIsAwaitingServer] = useState(false)
  const sawServerWorkingRef = useRef(false)
  const { marketingPost, isGettingMarketingPost } = useGetMarketingPostDetail(id, { poll: isAwaitingServer })
  // Ghim kênh chỉ để đánh dấu lúc thao tác, backend không quan tâm nên giữ ở máy
  const [pinnedChannels, setPinnedChannels] = useState<MarketingPostChannel[]>([])
  // Cắt nhiều ảnh phải chia lượt, admin cần thấy đang chạy tới đâu chứ không ngồi đoán
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null)
  // Thử lại hàng loạt ảnh lỗi cũng chạy từng ô một, banner phải nói đang tới ô thứ mấy
  const [failedRetryProgress, setFailedRetryProgress] = useState<{ current: number; total: number } | null>(null)
  // Chữ đang gõ dở, chưa kịp lưu. Lưu xong thì xoá đi để đọc thẳng từ server.
  const [captionEdits, setCaptionEdits] = useState<Partial<Record<MarketingPostChannel, MarketingStudioCaptionEdit>>>(
    {}
  )
  const saveTimersRef = useRef<Partial<Record<MarketingPostChannel, ReturnType<typeof setTimeout>>>>({})

  const { data: imageHistory } = useQuery({
    queryKey: marketingPostKeys.imageHistory(id ?? ''),
    queryFn: () => marketingPostService.getMarketingImageHistory({ id: id ?? '' }),
    enabled: Boolean(id),
    // Kho ảnh chỉ là phần bổ sung cho detail: hỏng thì Studio bớt lịch sử chứ không được sập
    throwOnError: false
  })

  const platforms = useMemo(() => marketingPost?.platforms.map((platform) => platform.platform) ?? [], [marketingPost])

  // Detail chỉ trả bản chốt, lịch sử nằm ở API riêng của từng nền tảng
  const contentQueries = useQueries({
    queries: platforms.map((platform) => ({
      queryKey: marketingPostKeys.contentVersions(id ?? '', platform),
      queryFn: () => marketingPostService.getMarketingContentVersions({ id: id ?? '', platform }),
      enabled: Boolean(id),
      // Lịch sử hỏng thì rơi về bản chốt trong detail, vẫn dùng được màn hình
      throwOnError: false
    }))
  })

  const contentStamp = contentQueries.map((query) => query.dataUpdatedAt).join()
  const contentHistories = useMemo(
    () => Object.fromEntries(platforms.map((platform, index) => [platform, contentQueries[index]?.data])),
    // contentQueries đổi tham chiếu mỗi lần render, mốc cập nhật mới là thứ đáng theo dõi
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [platforms, contentStamp]
  )

  const { official } = useGetMarketingPostOfficial({ id, platforms })

  const getSourceName = useCallback((index: number) => t('marketingPosts.detail.imageAlt', { index: index + 1 }), [t])

  const state = useMemo(
    () => (marketingPost ? toStudioState(marketingPost, imageHistory, contentHistories, getSourceName) : null),
    [marketingPost, imageHistory, contentHistories, getSourceName]
  )

  const notAvailable = useCallback(() => {
    toast.info(t('marketingPosts.studio.comingSoon'))
  }, [t])

  const onMutationError = useCallback(
    (error: Parameters<typeof getApiErrorDetail>[0]) => {
      // 409 nghĩa là trạng thái phía server đã khác - đọc lại rồi hãy cho bấm tiếp
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(id ?? '') })

      const messageCode = error.response?.data?.messageCode
      const errorKey = messageCode ? getPublicationErrorKey(parsePublicationErrorCode(messageCode).baseCode) : null

      // Backend trả mã riêng cho phần lớn lỗi, nhưng khi bài đã chốt/đã đăng thì nó chỉ trả
      // `CONFLICT` kèm một câu tiếng Anh tự do ("Platform post content cannot be changed in its
      // current state"). Mã chung chung như vậy thì không tra bảng được, nên dịch theo mã HTTP:
      // 409 ở luồng này luôn có nghĩa là trạng thái phía server đã khác.
      const description = errorKey
        ? t(`marketingPosts.publication.error.${errorKey}`)
        : error.response?.status === 409
          ? t('marketingPosts.studio.error.stateChanged')
          : getApiErrorDetail(error)

      toast.error(t('marketingPosts.generate.error.title'), { description })
    },
    [queryClient, t, id]
  )

  const onPostUpdated = useCallback(
    (post: MarketingPostCoreDetail) => {
      queryClient.setQueryData(marketingPostKeys.detail(post.basePostId), post)
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      // Bảng soát trước khi đăng đọc từ API bản chốt, đổi gì cũng phải hỏi lại
      // không thì nó báo thiếu theo dữ liệu cũ
      queryClient.invalidateQueries({ queryKey: [...marketingPostKeys.detail(post.basePostId), 'official'] })
      // Preview cũng đọc đúng bản chốt đó, và `staleTime: 0` chỉ đọc lại lúc mount - khối chốt
      // đăng không mount lại trong suốt lượt sinh. Không hỏi lại thì nó giữ nguyên kết quả của
      // lần đọc đầu (lúc chưa có nội dung lẫn ảnh) và khoá nút đăng vĩnh viễn dù bài đã đủ.
      queryClient.invalidateQueries({ queryKey: [...publicationKeys.previews(), post.basePostId] })
      // Scheduled edits replace the pending job, so schedule actions must use its new ID/revision.
      queryClient.invalidateQueries({ queryKey: [...publicationKeys.lists(), post.basePostId] })
      queryClient.invalidateQueries({ queryKey: publicationKeys.details() })
    },
    [queryClient]
  )

  // Nội dung đổi thì lịch sử version cũng đổi theo, phải nạp lại nếu bảng lịch sử đang mở
  const refreshContentVersions = useCallback(
    (platform: MarketingPostPlatform) => {
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.contentVersions(id ?? '', platform) })
    },
    [queryClient, id]
  )

  const refreshImageHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: marketingPostKeys.imageHistory(id ?? '') })
  }, [queryClient, id])

  // Bước 2 chỉ chọn rồi bay thẳng sang đây, việc gọi AI làm tại Studio - trang này không
  // rời đi nên tiến độ, khoá nút và đọc lại kết quả đều ở một chỗ.
  const startWaitingForServer = useCallback(() => {
    sawServerWorkingRef.current = false
    setIsAwaitingServer(true)
  }, [])

  // Lượt sinh này được gọi trong useEffect lúc mount. StrictMode gỡ rồi gắn lại subscription,
  // observer của useMutation bị tách khỏi mutation đang chạy nên `isPending` kẹt `true` mãi -
  // lỗi về rồi mà banner vẫn đếm. Đọc từ mutation cache thì không phụ thuộc observer nữa.
  const isRunningSelection = useIsMutating({ mutationKey: marketingPostKeys.selectionGenerate(id ?? '') }) > 0
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const { mutate: runSelectionGenerate } = useMutation({
    mutationKey: marketingPostKeys.selectionGenerate(id ?? ''),
    onMutate: startWaitingForServer,
    mutationFn: async ({
      channels,
      images,
      templates = {}
    }: {
      channels: MarketingPostChannel[]
      images: MarketingGenerateSelection['images']
      templates?: MarketingTemplateSelections
    }) => {
      const catalog = Object.keys(templates).length ? await getImageTemplates() : []
      const plans = channels.map((channel) => {
        const selection = templates[channel]
        if (!selection)
          return { platform: channelPlatforms[channel], pairs: toImagePairs(images), selection: null, template: null }
        const template = catalog.find(
          (item) => item.id === selection.templateId && item.platform === channelPlatforms[channel] && item.canApply
        )
        if (
          !template ||
          selection.sourceImageIds.length !== template.ratios.length ||
          selection.sourceImageIds.some((source) => !source)
        ) {
          throw new Error(t('marketingPosts.templates.missing'))
        }
        return { platform: channelPlatforms[channel], pairs: templatePairs(template, selection), selection, template }
      })
      let post = await marketingPostService.generateMarketingPost({
        id: id ?? '',
        body: { mode: MarketingPostGenerateMode.Content, platforms: plans.map(({ platform }) => ({ platform })) }
      })
      // Save the complete slot plan before generating. Partial failures preserve empty slots and block publication.
      for (const plan of plans) {
        if (!plan.template) continue
        post = await marketingPostService.updateMarketingPlatformImages({
          id: id ?? '',
          platform: plan.platform,
          imageTemplateId: plan.template.id,
          images: plan.pairs.map((pair, index) => ({
            sourceBasePostImageId: pair.imageId,
            ratioCode: pair.ratioCode,
            selectedGeneratedPostImageId: null,
            sortOrder: index + 1
          }))
        })
      }
      const unique = [
        ...new Map(
          plans.flatMap((plan) => plan.pairs).map((pair) => [`${pair.imageId}:${pair.ratioCode}`, pair])
        ).values()
      ]
      const batches = toBatches(unique)
      for (const [index, batch] of batches.entries()) {
        setBatchProgress({ current: index + 1, total: batches.length })
        const platforms = plans
          .map((plan) => ({
            platform: plan.platform,
            ratios: toBatchRatioRequests(
              batch.filter((pair) =>
                plan.pairs.some((wanted) => wanted.imageId === pair.imageId && wanted.ratioCode === pair.ratioCode)
              )
            )
          }))
          .filter((plan) => plan.ratios.length > 0)
        post = await marketingPostService.generateMarketingPost({
          id: id ?? '',
          body: { mode: MarketingPostGenerateMode.Images, platforms }
        })
      }
      return post
    },
    onSettled: () => {
      setBatchProgress(null)
      setIsAwaitingServer(false)
    },
    onSuccess: (post) => {
      onPostUpdated(post)
      post.platforms.forEach((platform) => refreshContentVersions(platform.platform))
      refreshImageHistory()
    },
    onError: (error, selection) => {
      onMutationError(error)

      // Lỗi ngay từ đầu (vd backend chưa cấu hình system prompt) thì chưa nền tảng nào được tạo,
      // Studio chỉ còn khung trống. Đưa về bước 2, giữ nguyên lựa chọn để sửa rồi bấm lại.
      const post = queryClient.getQueryData<MarketingPostCoreDetail>(marketingPostKeys.detail(id ?? ''))

      if (!isMountedRef.current || !id || post?.platforms.length) return

      navigate(`${POSTS_PATH}/create/${id}/platforms`, { replace: true, state: { selection } })
    }
  })

  const { mutate: generate, isPending: isGenerating } = useMutation({
    onMutate: startWaitingForServer,
    onSettled: () => setIsAwaitingServer(false),
    mutationFn: (body: GenerateMarketingPostBody) => marketingPostService.generateMarketingPost({ id: id ?? '', body }),
    onSuccess: (post) => {
      onPostUpdated(post)
      post.platforms.forEach((platform) => refreshContentVersions(platform.platform))
      refreshImageHistory()
    },
    onError: onMutationError
  })

  const { mutate: regenerateContent, isPending: isRegeneratingContent } = useMutation({
    onMutate: startWaitingForServer,
    onSettled: () => setIsAwaitingServer(false),
    mutationFn: ({
      platform,
      sourceGenerationId,
      feedback
    }: {
      platform: MarketingPostPlatform
      sourceGenerationId: string | null
      feedback: string | null
    }) =>
      marketingPostService.regenerateMarketingContent({
        id: id ?? '',
        platform,
        body: { sourceGenerationId, feedback }
      }),
    onSuccess: (post, { platform }) => {
      onPostUpdated(post)
      refreshContentVersions(platform)
    },
    onError: onMutationError
  })

  const { mutate: saveContent, isPending: isSavingContent } = useMutation({
    mutationFn: ({ platform, edit }: { platform: MarketingPostPlatform; edit: MarketingStudioCaptionEdit }) =>
      marketingPostService.updateMarketingContent({
        id: id ?? '',
        platform,
        body: {
          title: edit.title?.trim() || null,
          content: edit.content,
          hashtag: edit.hashtags.join(' ') || null
        }
      }),
    onSuccess: (post, { platform }) => {
      onPostUpdated(post)
      refreshContentVersions(platform)
      // Server giữ bản này rồi, bỏ bản nháp ở máy để không che mất dữ liệu thật
      setCaptionEdits((previous) => {
        const next = { ...previous }
        delete next[platformChannels[platform]]

        return next
      })
    },
    onError: onMutationError
  })

  const { mutate: selectContent, isPending: isSelectingContent } = useMutation({
    mutationFn: ({ platform, generationId }: { platform: MarketingPostPlatform; generationId: string }) =>
      marketingPostService.selectMarketingContent({ id: id ?? '', platform, generationId }),
    onSuccess: (post, { platform }) => {
      onPostUpdated(post)
      refreshContentVersions(platform)
    },
    onError: onMutationError
  })

  const { mutate: regenerateImageVersion, isPending: isRegeneratingImage } = useMutation({
    mutationFn: ({
      sourceBasePostImageId,
      ratioCode,
      sourceGeneratedPostImageId,
      feedback
    }: {
      sourceBasePostImageId: string
      ratioCode: MarketingPostRatioCode
      sourceGeneratedPostImageId: string | null
      feedback: string | null
    }) =>
      marketingPostService.regenerateMarketingImage({
        id: id ?? '',
        body: { sourceBasePostImageId, ratioCode, sourceGeneratedPostImageId, feedback }
      }),
    onSuccess: (version) => {
      refreshImageHistory()

      // Lượt cắt lỗi vẫn trả HTTP 200, phải đọc status mới biết
      if (version.status === MarketingPostImageStatus.Failed) {
        toast.error(t('marketingPosts.studio.imageFailed'), { description: version.errorMessage ?? undefined })

        return
      }

      toast.success(t('marketingPosts.studio.imageReady'))
    },
    onError: onMutationError
  })

  const { mutate: savePlatformImages, isPending: isSavingImages } = useMutation({
    mutationFn: ({
      platform,
      images,
      imageTemplateId
    }: {
      platform: MarketingPostPlatform
      images: MarketingPostImageSlot[]
      imageTemplateId?: string | null
    }) => marketingPostService.updateMarketingPlatformImages({ id: id ?? '', platform, images, imageTemplateId }),
    onSuccess: (post) => {
      onPostUpdated(post)
      // selectedPlatforms trong kho ảnh đổi theo, phải nạp lại
      refreshImageHistory()
    },
    onError: onMutationError
  })

  const { mutate: saveBasePost, isPending: isSavingBasePost } = useMutation({
    mutationFn: (body: SaveMarketingPostBody) => marketingPostService.updateMarketingPost({ id: id ?? '', body }),
    onSuccess: onPostUpdated,
    onError: onMutationError
  })

  const { mutate: deleteBasePost, isPending: isDeletingBasePost } = useMutation({
    mutationFn: () => marketingPostService.deleteMarketingPost({ id: id ?? '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      toast.success(t('marketingPosts.studio.discardSuccess'))
      navigate(POSTS_PATH)
    },
    onError: onMutationError
  })

  // Nói rõ đang chạy việc gì: ba lượt AI dài ngắn khác nhau, gộp chung một chữ "đang xử lý"
  // thì admin không biết nên chờ 5 giây hay 3 phút.
  // Chỉ khoá màn hình cho lượt AI. Mấy lệnh lưu chỉ mất vài trăm mili giây, khoá vào là
  // cướp con trỏ ngay giữa lúc đang gõ caption - nút của chúng tự mờ là đủ.
  // Server còn đang sinh thì vẫn phải khoá, kể cả khi lượt đó không do tab này bấm:
  // F5 giữa chừng, hoặc người khác đang chạy trên cùng bài. Backend khoá theo nền tảng
  // nên bấm thêm chỉ ăn 409.
  const isServerGenerating = Boolean(
    marketingPost?.platforms.some((platform) => runningStatuses.includes(platform.status))
  )

  // Chỉ dám kết luận "xong" sau khi đã thực sự thấy server bắt tay vào việc, không thì
  // giữa lúc vừa bấm mà nhịp hỏi chưa kịp chạy sẽ tưởng nhầm là đã xong.
  useEffect(() => {
    if (isServerGenerating) sawServerWorkingRef.current = true
  }, [isServerGenerating])

  const isServerDone = sawServerWorkingRef.current && !isServerGenerating
  // Còn lô sau chưa gửi thì vẫn là đang chạy, dù lô hiện tại đã xong
  const hasPendingBatch = batchProgress ? batchProgress.current < batchProgress.total : false
  const isWaitingOnServer = !isServerDone || hasPendingBatch

  const busyKey =
    (isRunningSelection || isGenerating) && isWaitingOnServer
      ? 'marketingPosts.studio.busy.generate'
      : isRegeneratingContent && isWaitingOnServer
        ? 'marketingPosts.studio.busy.content'
        : isRegeneratingImage || failedRetryProgress
          ? 'marketingPosts.studio.busy.image'
          : isServerGenerating
            ? 'marketingPosts.studio.busy.generate'
            : null

  const channels = useMemo(() => state?.draft.channels ?? [], [state])
  const pool = useMemo(() => state?.pool ?? [], [state])

  // Hướng chỉnh bấm nhanh và ô ghi chú gộp thành một câu feedback gửi cho AI.
  // Tweak nội dung và tweak ảnh nằm ở hai nhánh i18n khác nhau nên phải nhận tiền tố,
  // lấy nhầm nhánh là câu gửi AI thành nguyên cái key.
  const toFeedback = useCallback(
    (prefix: string, { tweaks, note }: { tweaks: string[]; note: string }) => {
      const parts = [...tweaks.map((tweak) => t(`${prefix}.${tweak}`)), note.trim()]

      return (
        parts
          // Thiếu bản dịch thì i18next trả lại chính cái key - thà bỏ còn hơn gửi rác cho AI
          .filter((part) => part && !part.startsWith('marketingPosts.'))
          .join('. ') || null
      )
    },
    [t]
  )

  const findChannelDraft = useCallback(
    (channel: MarketingPostChannel) => state?.channelDrafts.find((item) => item.channel === channel),
    [state]
  )

  // Ô ảnh của một kênh dưới dạng backend hiểu. PUT thay toàn bộ tập nên luôn phải dựng đủ.
  const buildSlots = useCallback(
    (channelDraft: MarketingStudioChannelDraft): MarketingPostImageSlot[] =>
      channelDraft.imageIds
        .map((imageId, index) => {
          const image = pool.find((item) => item.id === imageId)

          if (!image) return null

          const attempt = channelDraft.imageVersions[imageId] ?? image.attempt
          // Bản lỗi không chốt được, rơi về bản chạy được gần nhất
          const version =
            image.versions.find((item) => item.attempt === attempt && !item.isFailed) ??
            [...image.versions].reverse().find((item) => !item.isFailed)

          return {
            sourceBasePostImageId: image.sourceBasePostImageId,
            ratioCode: image.ratioCode,
            selectedGeneratedPostImageId: version?.generatedPostImageId ?? null,
            sortOrder: index + 1
          }
        })
        .filter((slot): slot is MarketingPostImageSlot => Boolean(slot)),
    [pool]
  )

  const commitSlots = useCallback(
    (channel: MarketingPostChannel, slots: MarketingPostImageSlot[]) =>
      savePlatformImages({
        platform: channelPlatforms[channel],
        images: slots,
        imageTemplateId:
          marketingPost?.platforms.find((item) => item.platform === channelPlatforms[channel])?.imageTemplateId ?? null
      }),
    [savePlatformImages, marketingPost]
  )

  const buildRatioRequests = useCallback(
    (entries: { sourceIndex: number; ratio: MarketingPostImageRatio }[]): MarketingPostRatioRequest[] => {
      if (!marketingPost) return []

      const baseImages = [...marketingPost.baseImages].sort((a, b) => a.sortOrder - b.sortOrder)

      return toRatioRequests(
        entries.map(({ sourceIndex, ratio }) => ({ baseImageId: baseImages[sourceIndex]?.id, ratio }))
      )
    },
    [marketingPost]
  )

  const buildBaseBody = useCallback(
    (overrides: Partial<SaveMarketingPostBody> = {}): SaveMarketingPostBody | null => {
      if (!marketingPost) return null

      return {
        title: marketingPost.title,
        content: marketingPost.content,
        hashtag: marketingPost.hashtag,
        images: [...marketingPost.baseImages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
            width: image.width,
            height: image.height
          })),
        ...overrides
      }
    },
    [marketingPost]
  )

  // --- Nội dung (mốc 5) ---

  const regenerateChannel = useCallback(
    (
      channel: MarketingPostChannel,
      request: { tweaks: MarketingStudioTweak[]; note: string; source: string | null }
    ) => {
      regenerateContent({
        platform: channelPlatforms[channel],
        // Người dùng tự chọn viết mới từ bài gốc hay viết tiếp từ một bản cũ.
        // Backend không tự lấy bản đang chốt, bỏ trống là làm lại từ bài gốc.
        sourceGenerationId: request.source,
        feedback: toFeedback('marketingPosts.studio.regenerate.tweak', request)
      })
    },
    [toFeedback, regenerateContent]
  )

  const regenerateAll = useCallback(
    ({ content, hashtags }: { content: string; hashtags: string[] }) => {
      const body = buildBaseBody({ content, hashtag: hashtags.join(' ') || null })

      if (!body) return

      // Sửa nội dung gốc thì phải lưu trước, AI đọc bản đã lưu chứ không đọc ô nhập
      saveBasePost(body, {
        onSuccess: (post) => {
          onPostUpdated(post)

          const targets = post.platforms.filter(
            (platform) => !pinnedChannels.includes(platformChannels[platform.platform])
          )

          // Ghim hết thì không còn kênh nào để viết lại. Nút đã bị khoá ở màn hình, nhưng
          // vẫn nói ra chứ đừng để người dùng đoán vì sao bấm xong không thấy gì.
          if (targets.length === 0) {
            toast.info(t('marketingPosts.studio.source.allPinnedNote'))

            return
          }

          targets.forEach((platform) =>
            regenerateContent({ platform: platform.platform, sourceGenerationId: null, feedback: null })
          )
        }
      })
    },
    [buildBaseBody, saveBasePost, onPostUpdated, regenerateContent, pinnedChannels, t]
  )

  const updateCaption = useCallback(
    (channel: MarketingPostChannel, edit: MarketingStudioCaptionEdit) => {
      setCaptionEdits((previous) => ({ ...previous, [channel]: edit }))

      clearTimeout(saveTimersRef.current[channel])
      saveTimersRef.current[channel] = setTimeout(() => {
        if (!edit.content.trim()) return

        saveContent({ platform: channelPlatforms[channel], edit })
      }, CAPTION_SAVE_DELAY_MS)
    },
    [saveContent]
  )

  const revertCaption = useCallback((channel: MarketingPostChannel) => {
    clearTimeout(saveTimersRef.current[channel])
    setCaptionEdits((previous) => {
      const next = { ...previous }
      delete next[channel]

      return next
    })
  }, [])

  const selectCaptionRevision = useCallback(
    (channel: MarketingPostChannel, revision: number) => {
      const target = findChannelDraft(channel)?.revisions.find((item) => item.revision === revision)

      if (!target) return

      selectContent({ platform: channelPlatforms[channel], generationId: target.generationId })
    },
    [findChannelDraft, selectContent]
  )

  // --- Ảnh (mốc 6) ---

  const regenerateImage = useCallback(
    (
      jobId: string,
      _channel: MarketingPostChannel | null,
      request?: { tweaks: MarketingStudioImageTweak[]; note: string; source: string | null }
    ) => {
      const image = pool.find((item) => item.id === jobId)

      if (!image) return

      regenerateImageVersion(
        {
          sourceBasePostImageId: image.sourceBasePostImageId,
          ratioCode: image.ratioCode,
          // Người dùng chọn cắt lại từ ảnh gốc hay sửa tiếp trên một bản đã cắt.
          // Nút "Thử lại" ở ô lỗi không có popover nên luôn dựng lại từ ảnh gốc.
          sourceGeneratedPostImageId: request?.source ?? null,
          feedback: request ? toFeedback('marketingPosts.studio.imageRegenerate.tweak', request) : null
        },
        {
          onSuccess: (version) => {
            if (version.status === MarketingPostImageStatus.Failed) return

            // Một lượt cắt lỗi đẩy nền tảng sang `Partial` ("Some image generations failed") và
            // từ đó preview chặn đăng với INVALID_SELECTED_IMAGE. Backend chỉ tính lại trạng thái
            // đó khi nhận PUT ảnh của nền tảng, nên cắt lại thành công thôi chưa gỡ được: phải
            // chốt lại đúng tập ảnh đang chọn. Tập không đổi nên với admin là không có gì xảy ra.
            channels.forEach((channel) => {
              const channelDraft = findChannelDraft(channel)

              // Kênh đã đăng thì backend từ chối ghi; chốt lại ở đó chỉ đổi lấy một toast lỗi
              if (channelDraft && !channelDraft.isLocked) commitSlots(channel, buildSlots(channelDraft))
            })
          }
        }
      )
    },
    [pool, regenerateImageVersion, toFeedback, channels, findChannelDraft, buildSlots, commitSlots]
  )

  // Bấm "Thử lại" cho từng ô lỗi thì N ô là N lần bấm. Gửi lần lượt chứ không bắn song song:
  // mỗi lượt cắt giữ AI cả phút và backend chưa nói nhận được bao nhiêu lượt cùng lúc.
  // Gọi thẳng service thay vì mutate để không nổ một toast cho mỗi ô, cuối lượt báo gộp một lần.
  const retryFailedImages = useCallback(async () => {
    const targets = pool.filter((image) => image.versions.every((version) => version.isFailed))

    if (!id || targets.length === 0) return

    let succeeded = 0
    let isCompleted = false

    try {
      for (const [index, image] of targets.entries()) {
        setFailedRetryProgress({ current: index + 1, total: targets.length })

        const version = await marketingPostService.regenerateMarketingImage({
          id,
          body: {
            sourceBasePostImageId: image.sourceBasePostImageId,
            ratioCode: image.ratioCode,
            sourceGeneratedPostImageId: null,
            feedback: null
          }
        })

        if (version.status !== MarketingPostImageStatus.Failed) succeeded += 1
        // Nạp lại sau từng ô để ô nào xong là hiện ảnh ngay, không đợi hết cả lượt
        refreshImageHistory()
      }

      isCompleted = true
    } catch (error) {
      // Lỗi HTTP (409 đang bận, 429, mất mạng) thì các ô sau cũng sẽ ăn y hệt - dừng lại mà báo
      onMutationError(error as Parameters<typeof onMutationError>[0])
    } finally {
      setFailedRetryProgress(null)
      refreshImageHistory()
    }

    // Cùng lý do với nút thử lại từng ô: phải chốt lại tập ảnh thì backend mới gỡ trạng thái `Partial`
    if (succeeded > 0) {
      channels.forEach((channel) => {
        const channelDraft = findChannelDraft(channel)

        if (channelDraft && !channelDraft.isLocked) commitSlots(channel, buildSlots(channelDraft))
      })
    }

    if (!isCompleted) return

    if (succeeded === targets.length) {
      toast.success(t('marketingPosts.studio.pool.retryAllDone', { count: succeeded }))
    } else {
      toast.warning(t('marketingPosts.studio.pool.retryAllPartial', { succeeded, total: targets.length }))
    }
  }, [pool, id, refreshImageHistory, onMutationError, channels, findChannelDraft, commitSlots, buildSlots, t])

  // Ưng bản nào rồi muốn đúng kiểu đó ở tỉ lệ khác. Backend chặn lấy bản khác cặp làm gốc
  // ("Source image does not match the requested ratio"), nên cắt lại từ ảnh gốc nhưng mang
  // theo yêu cầu đã tạo ra bản đang ưng.
  const cloneImageRatio = useCallback(
    (jobId: string, channel: MarketingPostChannel | null, ratio: MarketingPostImageRatio) => {
      const image = pool.find((item) => item.id === jobId)

      if (!image) return

      const channelDraft = channel ? findChannelDraft(channel) : undefined
      const attempt = channelDraft?.imageVersions[image.id] ?? image.attempt
      const current = image.versions.find((item) => item.attempt === attempt && !item.isFailed)

      regenerateImageVersion({
        sourceBasePostImageId: image.sourceBasePostImageId,
        ratioCode: marketingPostImageRatioCodes[ratio],
        sourceGeneratedPostImageId: null,
        feedback: current?.note || null
      })
    },
    [pool, findChannelDraft, regenerateImageVersion]
  )

  const selectImageVersion = useCallback(
    (channel: MarketingPostChannel, imageId: string, attempt: number) => {
      const channelDraft = findChannelDraft(channel)

      if (!channelDraft) return

      // Bản cắt lỗi không có ảnh nên backend từ chối chốt. Không nói ra thì bấm xong
      // không thấy gì đổi, tưởng nút hỏng.
      const version = pool.find((item) => item.id === imageId)?.versions.find((item) => item.attempt === attempt)

      if (version?.isFailed) {
        toast.error(t('marketingPosts.studio.pool.versionFailed'), { description: version.errorMessage ?? undefined })

        return
      }

      const imageVersions = { ...channelDraft.imageVersions, [imageId]: attempt }

      commitSlots(channel, buildSlots({ ...channelDraft, imageVersions }))
    },
    [findChannelDraft, buildSlots, commitSlots, pool, t]
  )

  const toggleChannelImage = useCallback(
    (channel: MarketingPostChannel, imageId: string) => {
      const channelDraft = findChannelDraft(channel)

      if (!channelDraft) return

      const imageIds = channelDraft.imageIds.includes(imageId)
        ? channelDraft.imageIds.filter((item) => item !== imageId)
        : [...channelDraft.imageIds, imageId]

      commitSlots(channel, buildSlots({ ...channelDraft, imageIds }))
    },
    [findChannelDraft, buildSlots, commitSlots]
  )

  const reorderChannelImages = useCallback(
    (channel: MarketingPostChannel, imageIds: string[]) => {
      const channelDraft = findChannelDraft(channel)

      if (!channelDraft) return

      commitSlots(channel, buildSlots({ ...channelDraft, imageIds }))
    },
    [findChannelDraft, buildSlots, commitSlots]
  )

  // Cắt thêm tỉ lệ mới thì dùng generate: nó sinh hàng loạt và tự chốt vào ô còn trống,
  // khác với cắt lại một ảnh vốn chỉ đẻ thêm bản vào kho.
  const addImageRatios = useCallback(
    (entries: { sourceIndex: number; ratio: MarketingPostImageRatio }[]) => {
      const ratios = buildRatioRequests(entries)

      if (ratios.length === 0 || channels.length === 0) return

      if (countPairs(ratios) > MARKETING_POST_MAX_IMAGE_PAIRS) {
        toast.error(t('marketingPosts.studio.pool.tooManyPairs', { max: MARKETING_POST_MAX_IMAGE_PAIRS }))

        return
      }

      generate({
        mode: MarketingPostGenerateMode.Images,
        platforms: channels.map((channel) => ({ platform: channelPlatforms[channel], ratios }))
      })
    },
    [buildRatioRequests, channels, generate, t]
  )

  // --- Bài gốc ---

  const addSourceImages = useCallback(
    (images: CreateMarketingPostImage[]) => {
      if (images.length === 0) return

      const body = buildBaseBody()

      if (!body) return

      saveBasePost(
        {
          ...body,
          images: [
            ...body.images,
            ...images.map((image, index) => ({
              imageUrl: image.url,
              sortOrder: body.images.length + index + 1,
              width: null,
              height: null
            }))
          ]
        },
        {
          onSuccess: (post) => {
            onPostUpdated(post)

            // Ảnh nguồn vừa thêm chưa cắt lần nào nên kho ảnh chưa có nhóm cho nó - pool sẽ
            // trống trơn. Phải cắt ngay theo tỉ lệ admin vừa chọn thì mới thấy gì.
            const ratios = toRatioRequests(
              images.flatMap((image) => {
                const baseImageId = post.baseImages.find((item) => item.imageUrl === image.url)?.id

                return image.ratios.map((ratio) => ({ baseImageId, ratio }))
              })
            )

            if (ratios.length === 0 || channels.length === 0) return

            if (countPairs(ratios) > MARKETING_POST_MAX_IMAGE_PAIRS) {
              toast.error(t('marketingPosts.studio.pool.tooManyPairs', { max: MARKETING_POST_MAX_IMAGE_PAIRS }))

              return
            }

            generate({
              mode: MarketingPostGenerateMode.Images,
              platforms: channels.map((channel) => ({ platform: channelPlatforms[channel], ratios }))
            })
          }
        }
      )
    },
    [buildBaseBody, saveBasePost, onPostUpdated, channels, generate, t]
  )

  const addChannel = useCallback(
    (channel: MarketingPostChannel) => {
      if (channels.includes(channel)) return

      const ratios = buildRatioRequests(pool.map((image) => ({ sourceIndex: image.sourceIndex, ratio: image.ratio })))

      // Pool chưa có ảnh nào thì kênh mới chỉ cần nội dung
      generate(
        ratios.length > 0
          ? { mode: MarketingPostGenerateMode.All, platforms: [{ platform: channelPlatforms[channel], ratios }] }
          : { mode: MarketingPostGenerateMode.Content, platforms: [{ platform: channelPlatforms[channel] }] }
      )
    },
    [channels, buildRatioRequests, pool, generate]
  )

  const togglePinChannel = useCallback((channel: MarketingPostChannel) => {
    setPinnedChannels((previous) =>
      previous.includes(channel) ? previous.filter((item) => item !== channel) : [...previous, channel]
    )
  }, [])

  const discardDraft = useCallback(() => deleteBasePost(), [deleteBasePost])

  useEffect(() => {
    const timers = saveTimersRef.current

    return () => Object.values(timers).forEach((timer) => clearTimeout(timer))
  }, [])

  const channelDrafts = useMemo(
    () =>
      (state?.channelDrafts ?? []).map((item) => {
        const edit = captionEdits[item.channel]

        return {
          ...item,
          isPinned: pinnedChannels.includes(item.channel),
          // Bản gõ dở đè lên bản chốt cho tới khi lưu xong
          edits: edit ? { [item.activeRevision]: edit } : {}
        }
      }),
    [state, pinnedChannels, captionEdits]
  )

  const availableChannels = useMemo(
    () => Object.values(platformChannels).filter((channel) => !channels.includes(channel)),
    [channels]
  )

  // Backend soát bản chốt kỹ hơn checklist ở máy, gộp lý do của nó vào cùng một chỗ hiển thị
  const notReadyReasons = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(official).map(([platform, value]) => {
          const status = marketingPost?.platforms.find((item) => item.platform === platform)?.status
          // API bản chốt vẫn báo `PublishingState` cho nền tảng đăng lỗi, nhưng backend cho tạo lần
          // đăng mới ở trạng thái này. Giữ lý do đó thì kênh bị chặn oan, không sửa rồi đăng lại được.
          const reasons = (value?.notReadyReasons ?? []).filter(
            (reason) =>
              !(
                reason === MarketingPostNotReadyReason.PublishingState &&
                status === MarketingPostPlatformStatus.PublishFailed
              )
          )

          return [platformChannels[platform as MarketingPostPlatform], reasons]
        })
      ) as Partial<Record<MarketingPostChannel, MarketingPostNotReadyReason[]>>,
    [official, marketingPost]
  )

  const failedImageCount = useMemo(
    () => pool.filter((image) => image.versions.every((version) => version.isFailed)).length,
    [pool]
  )

  return {
    marketingPost,
    draft: state?.draft ?? null,
    isEditing: Boolean(postId),
    isLoadingPost: isGettingMarketingPost,
    isDirty: Object.keys(captionEdits).length > 0,
    lockedChannel: null,
    pool,
    channelDrafts,
    imageJobs: state?.imageJobs ?? [],
    captionJobs: state?.captionJobs ?? [],
    busyKey,
    // Khoá nút theo đúng cái banner đang báo: server xong là mở lại ngay, không chờ
    // kết nối HTTP đóng
    isGenerating: Boolean(busyKey) || isRegeneratingImage || isSavingBasePost,
    batchProgress,
    failedRetryProgress,
    runSelectionGenerate,
    isFinalizing: isDeletingBasePost || isSavingImages || isSavingContent || isSelectingContent,
    failedImageCount,
    notReadyReasons,
    availableChannels,
    // Mốc 5: nội dung
    regenerateChannel,
    regenerateAll,
    updateCaption,
    revertCaption,
    selectCaptionRevision,
    // Mốc 6: ảnh
    regenerateImage,
    retryFailedImages,
    cloneImageRatio,
    selectImageVersion,
    toggleChannelImage,
    reorderChannelImages,
    addImageRatios,
    // PostCore
    addSourceImages,
    addChannel,
    togglePinChannel,
    discardDraft,
    // Đăng và hẹn lịch đã chuyển sang module publications. Riêng bỏ nền tảng khỏi bài thì
    // backend vẫn chưa có API.
    removeChannel: notAvailable as (channel: MarketingPostChannel) => void
  }
}

export type { PublishMode, MarketingStudioCaptionEdit }
