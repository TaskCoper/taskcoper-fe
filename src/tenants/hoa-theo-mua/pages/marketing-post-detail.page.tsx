import MarketingVideoEditor from '../features/marketing-posts/components/marketing-video-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStickyColumnOffset } from '@/hooks/use-sticky-column-offset'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { AlertTriangleIcon, ArrowLeftIcon, ExternalLinkIcon, PencilIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ImageLightbox from '../components/image-lightbox'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import MarketingPostPreview from '../features/marketing-posts/components/marketing-post-preview'
import { parseHashtags } from '../features/marketing-posts/hashtags'
import { useDeleteMarketingPost } from '../features/marketing-posts/hooks/use-delete-marketing-post'
import { useGetMarketingPostDetail } from '../features/marketing-posts/hooks/use-get-marketing-post-detail'
import { platformChannels } from '../features/marketing-posts/platform-channels'
import MarketingPublicationInsights from '../features/marketing-posts/publications/components/publication-insights'
import MarketingPublicationPanel from '../features/marketing-posts/publications/components/publication-panel'
import { PublicationStatus } from '../features/marketing-posts/publications/types'
import { marketingPostPlatformStatusBadgeClasses } from '../features/marketing-posts/status-badge'
import {
  isPublicationChild,
  isPublishingStatus,
  MarketingPostPlatformStatus,
  type MarketingPostPublishedChild,
  type MarketingPostPlatformDetail,
  type MarketingPostPublicationChild
} from '../features/marketing-posts/types'
import { usePlatformAccounts } from '../features/platform-accounts/hooks/use-platform-accounts'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

function DetailPanel({
  title,
  description,
  action,
  contentClassName,
  children
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <section className='flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm'>
      <div className='flex flex-wrap items-start justify-between gap-3 border-b bg-muted/20 px-5 py-4'>
        <div className='min-w-0'>
          <h2 className='font-bold'>{title}</h2>
          {description && <div className='mt-0.5 text-xs text-muted-foreground'>{description}</div>}
        </div>
        {action}
      </div>
      <div className={cn('flex-1 p-5', contentClassName)}>{children}</div>
    </section>
  )
}

function PlatformStatusBadge({ platform }: { platform: MarketingPostPlatformDetail }) {
  const { t } = useTenantTranslation()

  return (
    <Badge variant='outline' className={cn('font-normal', marketingPostPlatformStatusBadgeClasses[platform.status])}>
      {t(`marketingPosts.platformStatus.${platform.status}`)}
    </Badge>
  )
}

// Lần đăng thành công mới nhất của nền tảng - chỉ số và link bài đều lấy theo lần này
const getLatestPublication = (children: MarketingPostPublicationChild[], platform: MarketingPostPlatformDetail) =>
  children
    .filter(isPublicationChild)
    .filter((child) => child.platform === platform.platform && child.status === PublicationStatus.Succeeded)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0]

function PerformancePanel({ publication }: { publication: MarketingPostPublishedChild }) {
  const { t } = useTenantTranslation()
  const { accounts } = usePlatformAccounts()
  const account = accounts.find((item) => item.id === publication.platformAccountId)

  return (
    <DetailPanel
      title={t('marketingPosts.detail.section.performance')}
      description={
        <span className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
          <span className='font-medium text-foreground'>{t(`marketingPosts.platform.${publication.platform}`)}</span>
          {publication.publishedAt && <span aria-hidden='true'>·</span>}
          {publication.publishedAt && (
            <span className='tabular-nums'>
              {t('marketingPosts.detail.publishedAt', {
                time: formatDateTime(publication.publishedAt, 'dateTimeShort')
              })}
            </span>
          )}
          {account && <span>· {account.displayName}</span>}
        </span>
      }
      action={
        publication.externalPostUrl && (
          <Button size='sm' variant='outline' asChild>
            <a href={publication.externalPostUrl} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon />
              {t('marketingPosts.publication.action.openPost')}
            </a>
          </Button>
        )
      }
    >
      {(['facebook', 'instagram'] as string[]).includes(publication.platform) ? (
        <MarketingPublicationInsights publicationId={publication.publicationId} />
      ) : (
        <p className='text-sm text-muted-foreground'>{t('marketingPosts.insights.unsupported')}</p>
      )}
    </DetailPanel>
  )
}

function PlatformSection({
  postId,
  platform,
  publication
}: {
  postId: string
  platform: MarketingPostPlatformDetail
  publication?: MarketingPostPublishedChild
}) {
  const { t } = useTenantTranslation()
  const platformLabel = t(`marketingPosts.platform.${platform.platform}`)
  // Danh sách lần đăng (`children`) có thể chưa kịp có lần vừa đăng, nên xét cả trạng thái nền tảng
  const isPublished = Boolean(publication) || platform.status === MarketingPostPlatformStatus.Published

  return (
    <div className='space-y-6'>
      {platform.lastError && (
        <div className='flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'>
          <AlertTriangleIcon className='mt-0.5 size-4 shrink-0' />
          <div>
            <p className='font-medium'>{t('marketingPosts.detail.field.lastError')}</p>
            <p className='mt-0.5'>{platform.lastError}</p>
          </div>
        </div>
      )}

      <div className={cn('grid items-start gap-6', !isPublished && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')}>
        <DetailPanel
          title={t('marketingPosts.detail.section.content')}
          description={
            platform.content && (
              <span className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                <span>{t('marketingPosts.detail.contentVersion', { version: platform.content.versionNo })}</span>
                <span>· {t(`marketingPosts.detail.source.${platform.content.source}`)}</span>
                <span className='tabular-nums'>· {formatDateTime(platform.content.createdAt, 'dateTimeShort')}</span>
              </span>
            )
          }
          contentClassName='space-y-3'
        >
          {platform.content ? (
            <>
              <MarketingPostPreview
                channel={platformChannels[platform.platform]}
                caption={{
                  title: platform.content.title,
                  content: platform.content.content,
                  hashtags: parseHashtags(platform.content.hashtag ?? '')
                }}
                images={platform.images.map((image) => ({
                  id: image.selectedGeneratedPostImageId,
                  url: image.imageUrl,
                  sourceName: platformLabel
                }))}
                isRegenerating={false}
              />

              {platform.images.length === 0 && (
                <p className='text-sm text-muted-foreground'>{t('marketingPosts.detail.noPlatformImages')}</p>
              )}
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('marketingPosts.detail.noPlatformContent')}</p>
          )}
        </DetailPanel>

        {/* Luồng đăng/đặt lịch của riêng nền tảng này. Đã đăng thành công thì link bài và chỉ số
            nằm ở khối hiệu quả phía trên rồi, không lặp lại thẻ "Đã đăng" ở đây. */}
        {!isPublished && (
          <DetailPanel title={t('marketingPosts.publication.title')}>
            <MarketingPublicationPanel id={postId} platform={platform.platform} />
          </DetailPanel>
        )}
      </div>
    </div>
  )
}

export default function MarketingPostDetailPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null)
  const [platformParam, setPlatformParam] = useQueryState('platform', parseAsString)
  const { marketingPost, isGettingMarketingPost } = useGetMarketingPostDetail(id)
  const { deleteMarketingPost, isDeletingMarketingPost } = useDeleteMarketingPost({
    onDeleteSuccess: () => navigate(POSTS_PATH, { replace: true })
  })
  // Nội dung gốc và thông tin bài bám theo khi cuộn, khỏi phải kéo ngược lên tìm
  const sideColumnRef = useStickyColumnOffset<HTMLDivElement>(24)

  if (isGettingMarketingPost) {
    return (
      <div className='mx-auto w-full max-w-7xl space-y-6 p-6'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-10 w-72' />
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
          <Skeleton className='h-96 w-full rounded-2xl' />
          <Skeleton className='h-96 w-full rounded-2xl' />
        </div>
      </div>
    )
  }

  if (!marketingPost) {
    return (
      <div className='space-y-6 p-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={POSTS_PATH}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('marketingPosts.detail.back')}
          </Link>
        </Button>
        <div className='rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground'>
          {t('marketingPosts.detail.notFound')}
        </div>
      </div>
    )
  }

  if (marketingPost.video) return <MarketingVideoEditor key={marketingPost.basePostId} post={marketingPost} readOnly />

  const publications = marketingPost.children ?? []
  const activePlatform =
    marketingPost.platforms.find((platform) => platform.platform === platformParam) ?? marketingPost.platforms[0]
  const canDelete = !marketingPost.platforms.some((platform) => isPublishingStatus(platform.status))
  const activePublication = activePlatform ? getLatestPublication(publications, activePlatform) : undefined

  const baseImages = [...marketingPost.baseImages].sort((a, b) => a.sortOrder - b.sortOrder)
  const lightboxImages = baseImages.map((image, index) => ({
    src: image.imageUrl,
    alt: t('marketingPosts.detail.imageAlt', { index: index + 1 })
  }))

  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto w-full max-w-7xl space-y-6 px-6 py-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={POSTS_PATH}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('marketingPosts.detail.back')}
          </Link>
        </Button>

        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h1 className='text-2xl font-bold wrap-break-word'>{marketingPost.title}</h1>
            <p className='mt-1 text-xs text-muted-foreground tabular-nums'>
              {t('marketingPosts.detail.field.createdAt')}: {formatDateTime(marketingPost.createdAt, 'dateTimeShort')}
              {marketingPost.updatedAt &&
                ` · ${t('marketingPosts.detail.field.updatedAt')}: ${formatDateTime(marketingPost.updatedAt, 'dateTimeShort')}`}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {/* Bài đã đăng thì không cho xoá, giấu luôn nút cho khỏi bấm nhầm */}
            {canDelete && (
              <Button
                variant='outline'
                size='sm'
                disabled={isDeletingMarketingPost}
                onClick={() => deleteMarketingPost(marketingPost.basePostId)}
                className='text-destructive hover:text-destructive'
              >
                <Trash2Icon />
                {t('marketingPosts.action.delete')}
              </Button>
            )}
            <Button size='sm' asChild>
              <Link to={`${POSTS_PATH}/${marketingPost.basePostId}/update`}>
                <PencilIcon />
                {t('marketingPosts.action.update')}
              </Link>
            </Button>
          </div>
        </div>

        <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
          <div className='min-w-0'>
            {activePlatform ? (
              // Mỗi nền tảng một tab thay vì xếp chồng: mỗi nền tảng có bản chốt, lịch sử đăng và
              // chỉ số riêng, dồn hết vào một trang dài thì rất khó tìm.
              <Tabs value={activePlatform.platform} onValueChange={setPlatformParam} className='gap-4'>
                <TabsList>
                  {marketingPost.platforms.map((platform) => (
                    <TabsTrigger key={platform.platformPostId} value={platform.platform} className='gap-2 px-3'>
                      {t(`marketingPosts.platform.${platform.platform}`)}
                      <PlatformStatusBadge platform={platform} />
                    </TabsTrigger>
                  ))}
                </TabsList>

                {marketingPost.platforms.map((platform) => (
                  <TabsContent key={platform.platformPostId} value={platform.platform}>
                    <PlatformSection
                      postId={marketingPost.basePostId}
                      platform={platform}
                      publication={getLatestPublication(publications, platform)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <DetailPanel title={t('marketingPosts.detail.section.platforms')} contentClassName='space-y-3'>
                <p className='text-sm text-muted-foreground'>{t('marketingPosts.detail.noPlatforms')}</p>
                <Button size='sm' asChild>
                  <Link to={`${POSTS_PATH}/create/${marketingPost.basePostId}/platforms`}>
                    <SparklesIcon />
                    {t('marketingPosts.create.stepTwoTitle')}
                  </Link>
                </Button>
              </DetailPanel>
            )}
          </div>

          <div ref={sideColumnRef} className='min-w-0 space-y-6 lg:sticky'>
            <DetailPanel title={t('marketingPosts.detail.section.base')} contentClassName='space-y-4'>
              {/* Nội dung gốc có thể dài cả trang, cuộn trong khung để cột phải không đẩy mất phần thông tin */}
              <p className='max-h-64 overflow-auto text-sm whitespace-pre-wrap'>{marketingPost.content}</p>

              {marketingPost.hashtag && (
                <p className='text-sm text-sky-700 dark:text-sky-400'>{marketingPost.hashtag}</p>
              )}

              {baseImages.length > 0 ? (
                <div className='grid grid-cols-3 gap-2'>
                  {baseImages.map((image, index) => (
                    <button
                      key={image.id}
                      type='button'
                      aria-label={t('marketingPosts.detail.openImage', { index: index + 1 })}
                      onClick={() => setLightboxImageIndex(index)}
                      className='aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <img
                        src={image.imageUrl}
                        alt={t('marketingPosts.detail.imageAlt', { index: index + 1 })}
                        className='size-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>{t('marketingPosts.detail.noImages')}</p>
              )}
            </DetailPanel>

            {/* Hiệu quả của nền tảng đang mở ở tab bên trái */}
            {activePublication && <PerformancePanel publication={activePublication} />}
          </div>
        </div>
      </div>

      <ImageLightbox
        slides={lightboxImages}
        index={lightboxImageIndex}
        onIndexChange={setLightboxImageIndex}
        label={t('marketingPosts.detail.lightbox.label')}
      />
    </div>
  )
}
