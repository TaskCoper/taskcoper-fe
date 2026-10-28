import MarketingStudioTemplateEditor from '../features/marketing-posts/studio/components/marketing-studio-template-editor'
import MarketingVideoEditor from '../features/marketing-posts/components/marketing-video-editor'
import { useGetMarketingPostDetail } from '../features/marketing-posts/hooks/use-get-marketing-post-detail'
import { channelPlatforms } from '../features/marketing-posts/platform-channels'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStickyColumnOffset } from '@/hooks/use-sticky-column-offset'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { ArrowLeftIcon, SparklesIcon, XIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import MarketingStudioChannelPanel from '../features/marketing-posts/studio/components/marketing-studio-channel-panel'
import MarketingStudioChannelPicker from '../features/marketing-posts/studio/components/marketing-studio-channel-picker'
import MarketingStudioImagePool from '../features/marketing-posts/studio/components/marketing-studio-image-pool'
import MarketingStudioPublishPanel from '../features/marketing-posts/studio/components/marketing-studio-publish-panel'
import MarketingPostBusyBanner from '../features/marketing-posts/components/marketing-post-busy-banner'
import MarketingStudioSourcePanel from '../features/marketing-posts/studio/components/marketing-studio-source-panel'
import { useMarketingStudio } from '../features/marketing-posts/studio/use-marketing-studio'
import type { SelectMarketingChannelsFormValues } from '../features/marketing-posts/validations'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`
const CREATE_PATH = `${POSTS_PATH}/create`

export default function MarketingPostStudioPage() {
  const { draftId, id } = useParams()
  const { marketingPost, isGettingMarketingPost } = useGetMarketingPostDetail(id ?? draftId)
  if (isGettingMarketingPost) return <Skeleton className='m-6 h-96 rounded-xl' />
  if (marketingPost?.video) return <MarketingVideoEditor key={marketingPost.basePostId} post={marketingPost} />
  return <MarketingPostImageStudioPage />
}

function MarketingPostImageStudioPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  // Pool ảnh dài ra rất nhanh khi nhiều ảnh nhiều tỉ lệ, phải dính được cả hai mép
  const poolColumnRef = useStickyColumnOffset<HTMLDivElement>(20)
  // Cột nội dung gốc + chốt đăng cũng vậy: cuộn ở cột giữa thì nút chốt phải luôn với tới được
  const sideColumnRef = useStickyColumnOffset<HTMLDivElement>(20)
  // Cột kênh dính nốt: cuộn ở pool ảnh thì caption và ảnh của kênh vẫn phải nhìn thấy
  const channelColumnRef = useStickyColumnOffset<HTMLDivElement>(20)
  const { draftId, id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [channelParam, setChannelParam] = useQueryState('studioChannel', parseAsString)
  // Bước 2 chỉ chọn rồi đẩy lựa chọn sang đây, việc gọi AI chạy tại trang này
  const pendingGenerate = (location.state as { generate?: SelectMarketingChannelsFormValues } | null)?.generate
  const hasStartedRef = useRef(false)

  const {
    draft,
    marketingPost,
    isEditing,
    isLoadingPost,
    lockedChannel,
    pool,
    channelDrafts,
    imageJobs,
    captionJobs,
    busyKey,
    isGenerating,
    failedImageCount,
    notReadyReasons,
    availableChannels,
    batchProgress,
    failedRetryProgress,
    runSelectionGenerate,
    updateCaption,
    revertCaption,
    togglePinChannel,
    selectCaptionRevision,
    addChannel,
    removeChannel,
    addImageRatios,
    addSourceImages,
    discardDraft,
    regenerateImage,
    retryFailedImages,
    cloneImageRatio,
    selectImageVersion,
    toggleChannelImage,
    reorderChannelImages,
    regenerateChannel,
    regenerateAll
  } = useMarketingStudio({ draftId, postId: id })

  useEffect(() => {
    if (!pendingGenerate || hasStartedRef.current) return

    hasStartedRef.current = true
    runSelectionGenerate(pendingGenerate)
    // Bỏ state khỏi history, không thì F5 lại chạy thêm một lượt AI nữa
    navigate(`${location.pathname}${location.search}`, { replace: true })
  }, [pendingGenerate, runSelectionGenerate, navigate, location.pathname, location.search])

  if (isLoadingPost) {
    return (
      <div className='space-y-6 p-6'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-10 w-72' />
        <Skeleton className='h-96 w-full rounded-xl' />
      </div>
    )
  }

  // Nháp chỉ sống trong bộ nhớ tab hiện tại: reload hoặc mở lại link cũ là không còn gì để dựng
  if (!draft) {
    return (
      <div className='space-y-6 p-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={POSTS_PATH}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('marketingPosts.detail.back')}
          </Link>
        </Button>

        <div className='space-y-3 rounded-xl border border-dashed p-10 text-center'>
          <p className='text-sm text-muted-foreground'>
            {t(isEditing ? 'marketingPosts.detail.notFound' : 'marketingPosts.studio.expired')}
          </p>
          {!isEditing && (
            <Button asChild size='sm'>
              <Link to={CREATE_PATH}>{t('marketingPosts.create.title')}</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Bài mới bấm Lưu ở bước 1 thì chưa có nền tảng nào. Mở Studio lúc này chỉ ra khung trống
  // mà chế độ sửa lại giấu nút thêm kênh, nên đưa về đúng bước chọn nền tảng để làm tiếp.
  if (isEditing && draft.channels.length === 0 && !isGenerating) {
    return <Navigate to={`${CREATE_PATH}/${draft.id}/platforms`} replace />
  }

  const activeChannel = draft.channels.find((channel) => channel === channelParam) ?? draft.channels[0] ?? null
  // Pool luôn thao tác trên kênh đang mở ("Đang chọn ảnh cho ..."), nên nó khoá theo đúng
  // kênh đó: kênh đã đăng thì mọi lệnh ghi lên ảnh đều bị backend trả 409
  const isActiveChannelLocked = Boolean(
    channelDrafts.find((channelDraft) => channelDraft.channel === activeChannel)?.isLocked
  )

  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto w-full max-w-8xl space-y-5 px-6 py-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={isEditing && id ? `${POSTS_PATH}/${id}` : POSTS_PATH}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t(isEditing ? 'marketingPosts.update.back' : 'marketingPosts.detail.back')}
          </Link>
        </Button>

        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='truncate text-2xl font-bold'>{draft.title}</h1>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              {t(isEditing ? 'marketingPosts.studio.editDescription' : 'marketingPosts.studio.description')}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='gap-1.5 font-normal'>
              <SparklesIcon className='size-3.5' />
              {t('marketingPosts.studio.jobSummary', { images: imageJobs.length, captions: captionJobs.length })}
            </Badge>
            {!isEditing && (
              <Button
                variant='ghost'
                size='sm'
                onClick={async () => {
                  const isConfirmed = await confirm({
                    title: t('marketingPosts.studio.discard.title'),
                    description: t('marketingPosts.studio.discard.description'),
                    confirmText: t('marketingPosts.studio.discard.confirmText'),
                    cancelText: t('common.button.cancel'),
                    variant: 'destructive'
                  })
                  if (isConfirmed) discardDraft()
                }}
                className='text-muted-foreground hover:text-destructive'
              >
                <XIcon />
                {t('marketingPosts.studio.discard.trigger')}
              </Button>
            )}
          </div>
        </div>

        {/* Lượt AI chạy tới ba phút: đếm giờ để biết nó còn sống, còn thao tác thì từng nút tự khoá */}
        {busyKey && (
          <MarketingPostBusyBanner
            title={
              failedRetryProgress
                ? t('marketingPosts.studio.busy.retryFailed', failedRetryProgress)
                : batchProgress
                  ? t('marketingPosts.create.generatingBatch', batchProgress)
                  : t(busyKey)
            }
          />
        )}

        <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,10fr)_minmax(0,5fr)]'>
          {/* Không đặt xl:top-*: hook tự tính mốc top theo chiều cao thật của cột. Pool dài hơn
              màn thì mốc là số âm để cuộn tới lúc đáy cột chạm đáy màn mới dừng, cuộn ngược lên
              thì dừng khi đỉnh cột chạm đỉnh màn. */}
          <div ref={poolColumnRef} className='xl:sticky'>
            <MarketingStudioImagePool
              isBusy={isGenerating}
              isLocked={
                isActiveChannelLocked ||
                Boolean(channelDrafts.find((item) => item.channel === activeChannel)?.imageTemplateId)
              }
              imageJobs={imageJobs}
              pool={pool}
              sourceImages={draft.images}
              channelDrafts={channelDrafts}
              activeChannel={activeChannel}
              onToggleImage={(imageId) => activeChannel && toggleChannelImage(activeChannel, imageId)}
              onRegenerateImage={(jobId, request) => regenerateImage(jobId, activeChannel, request)}
              onRetryFailedImages={retryFailedImages}
              onCloneRatio={(jobId, ratio) => cloneImageRatio(jobId, activeChannel, ratio)}
              onSelectImageVersion={(imageId, attempt) =>
                activeChannel && selectImageVersion(activeChannel, imageId, attempt)
              }
              onAddImageRatios={addImageRatios}
              onAddSourceImages={addSourceImages}
            />
          </div>

          <div ref={channelColumnRef} className='min-w-0 xl:sticky'>
            {/* Vừa từ bước 2 sang thì backend chưa kịp tạo nền tảng nào - dựng khung chờ
                thay vì để trống trơn, người dùng mới biết là nó đang chạy chứ không phải hỏng */}
            {draft.channels.length === 0 && isGenerating ? (
              <div className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
                <Skeleton className='h-9 w-full rounded-lg' />
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-32 w-full rounded-xl' />
                <Skeleton className='h-24 w-full rounded-xl' />
              </div>
            ) : (
              <Tabs value={activeChannel ?? undefined} onValueChange={setChannelParam} className='gap-4'>
                <div className='flex items-center gap-2'>
                  <TabsList className='flex-1'>
                    {draft.channels.map((channel) => {
                      // Kênh gốc của bài đang sửa không bỏ được, và phải chừa lại ít nhất một kênh
                      const canRemove = draft.channels.length > 1 && channel !== lockedChannel

                      return (
                        <div key={channel} className='relative flex-1'>
                          <TabsTrigger value={channel} className={cn('w-full', canRemove && 'pr-7')}>
                            {t(`marketingPosts.channel.${channel}`)}
                          </TabsTrigger>

                          {/* Nút bỏ nằm ngay trên tab cho dễ thấy. Là nút thật đặt cạnh trigger
                            chứ không lồng bên trong, nên bấm và tab bằng bàn phím đều chạy. */}
                          {canRemove && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              title={t('marketingPosts.studio.removeChannel.trigger')}
                              onClick={async () => {
                                const isConfirmed = await confirm({
                                  title: t('marketingPosts.studio.removeChannel.title'),
                                  description: t('marketingPosts.studio.removeChannel.description', {
                                    channel: t(`marketingPosts.channel.${channel}`)
                                  }),
                                  confirmText: t('marketingPosts.studio.removeChannel.confirmText'),
                                  cancelText: t('common.button.cancel'),
                                  variant: 'destructive'
                                })
                                if (!isConfirmed) return

                                // Tab đang mở bị bỏ thì xoá luôn tham số trên URL, không thì nó trỏ vào kênh không còn
                                if (channelParam === channel) setChannelParam(null)
                                removeChannel(channel)
                              }}
                              className='absolute top-1/2 right-1 size-5 -translate-y-1/2 text-muted-foreground hover:text-destructive'
                            >
                              <XIcon className='size-3' />
                              <span className='sr-only'>{t('marketingPosts.studio.removeChannel.trigger')}</span>
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </TabsList>
                  {/* Sửa bài thì không cho thêm nền tảng: một bài thuộc về đúng một kênh, muốn kênh
                    khác thì tạo bài mới cho rõ ràng */}
                  {!isEditing && (
                    <MarketingStudioChannelPicker
                      isBusy={isGenerating}
                      availableChannels={availableChannels}
                      onAddChannel={(channel) => {
                        addChannel(channel)
                        // Mở luôn tab vừa thêm, không bắt admin tự đi tìm
                        setChannelParam(channel)
                      }}
                    />
                  )}
                </div>

                {draft.channels.map((channel) => (
                  <TabsContent key={channel} value={channel}>
                    <MarketingStudioChannelPanel
                      templateEditor={
                        marketingPost &&
                        marketingPost.platforms
                          .filter((platform) => platform.platform === channelPlatforms[channel])
                          .map((platform) => (
                            <MarketingStudioTemplateEditor
                              key={`${platform.platform}-${platform.imageTemplateId}-${platform.templateImageIds?.join(',')}`}
                              post={marketingPost}
                              platform={platform}
                              disabled={
                                isGenerating ||
                                Boolean(channelDrafts.find((item) => item.channel === channel)?.isLocked)
                              }
                            />
                          ))
                      }
                      channel={channel}
                      channelDraft={channelDrafts.find((channelDraft) => channelDraft.channel === channel)}
                      pool={pool}
                      // Chỉ dựng khung chờ khi chưa có gì để hiện. Đang cắt ảnh hay viết lại mà
                      // xoá trắng nội dung đang có thì admin mất luôn cái để đối chiếu.
                      isRegenerating={
                        isGenerating &&
                        !channelDrafts.find((channelDraft) => channelDraft.channel === channel)?.revisions.length
                      }
                      onRegenerate={(options) => regenerateChannel(channel, options)}
                      onReorderImages={(imageIds) => reorderChannelImages(channel, imageIds)}
                      onToggleImage={(imageId) => toggleChannelImage(channel, imageId)}
                      onUpdateCaption={(edit) => updateCaption(channel, edit)}
                      onRevertCaption={() => revertCaption(channel)}
                      onTogglePin={() => togglePinChannel(channel)}
                      onSelectRevision={(revision) => selectCaptionRevision(channel, revision)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <div ref={sideColumnRef} className='space-y-5 xl:sticky'>
            <MarketingStudioSourcePanel
              draft={draft}
              isBusy={isGenerating}
              pinnedCount={channelDrafts.filter((channelDraft) => channelDraft.isPinned).length}
              channelCount={channelDrafts.length}
              onRegenerateAll={regenerateAll}
            />
            <MarketingStudioPublishPanel
              postId={id ?? draftId}
              channelDrafts={channelDrafts}
              pool={pool}
              isGenerating={isGenerating}
              isEditing={isEditing}
              failedImageCount={failedImageCount}
              notReadyReasons={notReadyReasons}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
