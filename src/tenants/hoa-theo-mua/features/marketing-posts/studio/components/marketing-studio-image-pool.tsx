import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ImageLightbox from '@/tenants/hoa-theo-mua/components/image-lightbox'
import {
  CheckIcon,
  HistoryIcon,
  ImageOffIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  ZoomInIcon
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { marketingPostImageRatios, type MarketingPostImageRatio } from '../../image-ratios'
import type { CreateMarketingPostImage, MarketingPostChannel } from '../../types'
import { isPreferredRatio } from '../channel-rules'
import { resolveChannelImage } from '../checklist'
import {
  MarketingStudioJobStatus,
  type MarketingStudioChannelDraft,
  type MarketingStudioImageJob,
  type MarketingStudioImageTweak,
  type MarketingStudioPoolImage
} from '../types'
import MarketingStudioImageRegenerate from './marketing-studio-image-regenerate'
import MarketingStudioRatioClone from './marketing-studio-ratio-clone'
import MarketingStudioImageAdder from './marketing-studio-image-adder'
import MarketingStudioRatioAdder from './marketing-studio-ratio-adder'

const ALL_RATIOS = 'all'

// Tạm ẩn nút "+ tỉ lệ" trong từng ô ảnh. Bật lại: đổi cờ này thành true, không cần sửa gì khác.
const SHOW_RATIO_CLONE: boolean = false

const toAspectRatio = (ratio: MarketingPostImageRatio) => ratio.replace(':', ' / ')

// Cắt lại không xoá bản cũ. Nút này mở ra toàn bộ các bản đã cắt của ô để quay về bản ưng hơn.
function VersionHistory({
  image,
  isBusy,
  onSelectVersion
}: {
  image: MarketingStudioPoolImage
  isBusy: boolean
  onSelectVersion: (attempt: number) => void
}) {
  const { t } = useTenantTranslation()
  const activeIndex = image.versions.findIndex((version) => version.attempt === image.attempt)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          title={t('marketingPosts.studio.pool.historyTitle')}
          className='flex items-center gap-0.5 rounded border px-1 font-mono text-[0.6rem] text-muted-foreground transition-colors hover:bg-muted'
        >
          <HistoryIcon className='size-2.5' />
          {t('marketingPosts.studio.pool.versionCount', {
            current: activeIndex + 1,
            total: image.versions.length
          })}
        </button>
      </PopoverTrigger>

      <PopoverContent align='start' className='w-56 space-y-2'>
        <div>
          <p className='text-sm font-medium'>{t('marketingPosts.studio.pool.historyTitle')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.pool.historyHint')}</p>
        </div>

        <div className='grid grid-cols-3 gap-1.5'>
          {image.versions.map((version, index) => (
            <button
              key={version.attempt}
              type='button'
              // Bản cắt lỗi không có ảnh để dùng, backend cũng từ chối chốt nó
              disabled={version.isFailed || isBusy}
              aria-pressed={version.attempt === image.attempt}
              title={
                version.isFailed ? (version.errorMessage ?? t('marketingPosts.studio.pool.versionFailed')) : undefined
              }
              onClick={() => onSelectVersion(version.attempt)}
              className={cn(
                'overflow-hidden rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring',
                version.isFailed
                  ? 'cursor-not-allowed border-rose-300 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30'
                  : version.attempt === image.attempt
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'hover:border-primary/50'
              )}
            >
              <div className='relative'>
                <img
                  src={version.url}
                  alt=''
                  className={cn('aspect-square w-full object-cover', version.isFailed && 'opacity-30 grayscale')}
                />
                {version.isFailed && (
                  <TriangleAlertIcon className='absolute inset-0 m-auto size-4 text-rose-600 dark:text-rose-400' />
                )}
              </div>
              <span
                className={cn(
                  'block py-0.5 font-mono text-[0.6rem] text-muted-foreground',
                  version.isFailed && 'text-rose-600 dark:text-rose-400'
                )}
              >
                {version.isFailed
                  ? t('marketingPosts.studio.pool.versionFailedLabel', { index: index + 1 })
                  : t('marketingPosts.studio.pool.versionLabel', { index: index + 1 })}
              </span>
              {/* Nhắc lại admin đã yêu cầu gì ở lượt cắt đó, khỏi đoán vì sao ra bản này */}
              {(version.tweaks.length > 0 || version.note) && (
                <span className='block px-1 pb-1 text-[0.55rem] leading-tight text-muted-foreground'>
                  {[
                    ...version.tweaks.map((tweak) => t(`marketingPosts.studio.imageRegenerate.tweak.${tweak}`)),
                    version.note
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PoolTile({
  image,
  order,
  usedByChannels,
  hasRatioWarning,
  isBusy,
  onToggle,
  onZoom,
  onRegenerate,
  onSelectVersion,
  missingRatios,
  onCloneRatio
}: {
  image: MarketingStudioPoolImage
  isBusy: boolean
  order: number | null
  usedByChannels: MarketingPostChannel[]
  hasRatioWarning: boolean
  onToggle: () => void
  onZoom: () => void
  onRegenerate: (request: { tweaks: MarketingStudioImageTweak[]; note: string; source: string | null }) => void
  onSelectVersion: (attempt: number) => void
  missingRatios: MarketingPostImageRatio[]
  onCloneRatio: (ratio: MarketingPostImageRatio) => void
}) {
  const { t } = useTenantTranslation()
  const isSelected = order !== null
  // Ô vẫn còn bản cũ dùng được nên không thành ô lỗi, nhưng lượt vừa bấm hỏng thì phải báo
  const lastVersion = image.versions[image.versions.length - 1]
  const hasFailedRetry = Boolean(lastVersion?.isFailed)

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-muted/30 transition-all',
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/50'
      )}
    >
      <button
        type='button'
        aria-pressed={isSelected}
        disabled={isBusy}
        onClick={onToggle}
        title={t('marketingPosts.studio.pool.toggle', { name: image.sourceName, ratio: image.ratio })}
        className='block w-full outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <div style={{ aspectRatio: toAspectRatio(image.ratio) }} className='w-full'>
          <img src={image.url} alt={image.sourceName} loading='lazy' className='size-full object-cover' />
        </div>
      </button>

      <span
        className={cn(
          'pointer-events-none absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold shadow-sm transition-colors',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/85 backdrop-blur-sm'
        )}
      >
        {isSelected ? order : <CheckIcon className='size-3 text-muted-foreground/70' />}
      </span>

      {/* Bấm vào ảnh là tick chọn, nên xem to phải có nút riêng - nấp cùng nút cắt lại */}
      <Button
        type='button'
        variant='secondary'
        size='icon'
        aria-label={t('marketingPosts.studio.pool.zoom', { name: image.sourceName, ratio: image.ratio })}
        onClick={onZoom}
        className='absolute top-1.5 right-9 size-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
      >
        <ZoomInIcon className='size-3' />
      </Button>

      {/* Ảnh cắt được nhưng xấu thì bảo AI cho bản khác, ảnh mới thay đúng chỗ ảnh này */}
      <MarketingStudioImageRegenerate
        imageName={image.sourceName}
        ratio={image.ratio}
        isBusy={isBusy}
        // Bản lỗi không có ảnh nên AI không sửa tiếp trên đó được
        sources={image.versions
          .filter((version) => !version.isFailed)
          .map((version, index) => ({
            value: version.generatedPostImageId,
            label: t('marketingPosts.studio.pool.versionLabel', { index: index + 1 })
          }))}
        onRegenerate={onRegenerate}
      />

      <div className='flex flex-wrap items-center justify-between gap-1 px-1.5 py-1'>
        <span className='flex items-center gap-1'>
          <span className='font-mono text-[0.65rem] text-muted-foreground'>{image.ratio}</span>
          {hasRatioWarning && (
            <Tooltip>
              <TooltipTrigger className='flex cursor-help items-center'>
                <TriangleAlertIcon className='size-3 text-amber-600' />
                <span className='sr-only'>{t('marketingPosts.studio.pool.ratioWarning')}</span>
              </TooltipTrigger>
              <TooltipContent>{t('marketingPosts.studio.pool.ratioWarning')}</TooltipContent>
            </Tooltip>
          )}
          {image.versions.length > 1 && (
            <VersionHistory image={image} isBusy={isBusy} onSelectVersion={onSelectVersion} />
          )}
          {SHOW_RATIO_CLONE && (
            <MarketingStudioRatioClone
              ratio={image.ratio}
              isBusy={isBusy}
              availableRatios={missingRatios}
              note={image.versions.find((version) => version.attempt === image.attempt)?.note ?? ''}
              onClone={onCloneRatio}
            />
          )}
          {hasFailedRetry && (
            <Tooltip>
              <TooltipTrigger className='flex cursor-help items-center'>
                <TriangleAlertIcon className='size-3 text-rose-600 dark:text-rose-400' />
                <span className='sr-only'>{t('marketingPosts.studio.pool.lastRetryFailed')}</span>
              </TooltipTrigger>
              <TooltipContent>
                {lastVersion?.errorMessage ?? t('marketingPosts.studio.pool.lastRetryFailed')}
              </TooltipContent>
            </Tooltip>
          )}
        </span>

        <span className='flex items-center gap-0.5'>
          {usedByChannels.map((channel) => (
            <Badge key={channel} variant='secondary' className='rounded px-1 py-0 text-[0.6rem] leading-4 font-medium'>
              {t(`marketingPosts.studio.channelShort.${channel}`)}
            </Badge>
          ))}
        </span>
      </div>
    </div>
  )
}

function FailedTile({ job, isBusy, onRetry }: { job: MarketingStudioImageJob; isBusy: boolean; onRetry: () => void }) {
  const { t } = useTenantTranslation()

  return (
    <div className='flex flex-col items-center justify-center gap-1.5 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-center'>
      <ImageOffIcon className='size-5 text-destructive' />
      <p className='text-[0.65rem] text-destructive'>{t('marketingPosts.studio.pool.failed')}</p>
      <p className='font-mono text-[0.6rem] text-muted-foreground'>{job.ratio}</p>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={isBusy}
        onClick={onRetry}
        className='h-6 px-2 text-[0.65rem]'
      >
        <RefreshCwIcon className='size-3' />
        {t('marketingPosts.studio.pool.retry')}
      </Button>
    </div>
  )
}

function PendingTile({ job }: { job: MarketingStudioImageJob }) {
  return (
    <div
      style={{ aspectRatio: toAspectRatio(job.ratio) }}
      className='flex w-full animate-pulse items-center justify-center rounded-xl border bg-muted/50'
    >
      {job.status === MarketingStudioJobStatus.Running && (
        <LoaderCircleIcon className='size-4 animate-spin text-muted-foreground' />
      )}
    </div>
  )
}

// Pool dùng chung cho cả ba kênh: ảnh cắt 16:9 cho Facebook vẫn tick sang Instagram được.
// Lưới vẽ theo hàng đợi job chứ không theo ảnh đã xong, nhờ vậy ô đang chạy và ô cắt lỗi
// vẫn giữ đúng vị trí của nó thay vì biến mất.
const MarketingStudioImagePool = ({
  imageJobs,
  pool,
  sourceImages,
  channelDrafts,
  activeChannel,
  onToggleImage,
  isBusy,
  isLocked,
  onRegenerateImage,
  onRetryFailedImages,
  onCloneRatio,
  onSelectImageVersion,
  onAddImageRatios,
  onAddSourceImages
}: {
  imageJobs: MarketingStudioImageJob[]
  pool: MarketingStudioPoolImage[]
  sourceImages: CreateMarketingPostImage[]
  channelDrafts: MarketingStudioChannelDraft[]
  activeChannel: MarketingPostChannel | null
  onToggleImage: (imageId: string) => void
  isBusy: boolean
  // Kênh đang mở đã đăng ra ngoài: backend từ chối mọi lệnh ghi lên nó (409), nên cả pool
  // chuyển sang chỉ đọc. Xem ảnh to thì vẫn cho, đó là thao tác đọc.
  isLocked: boolean
  onRegenerateImage: (
    jobId: string,
    request?: { tweaks: MarketingStudioImageTweak[]; note: string; source: string | null }
  ) => void
  onRetryFailedImages: () => void
  onCloneRatio: (jobId: string, ratio: MarketingPostImageRatio) => void
  onSelectImageVersion: (imageId: string, attempt: number) => void
  onAddImageRatios: (entries: { sourceIndex: number; ratio: MarketingPostImageRatio }[]) => void
  onAddSourceImages: (images: CreateMarketingPostImage[]) => void
}) => {
  const { t } = useTenantTranslation()
  const [ratioFilter, setRatioFilter] = useState<MarketingPostImageRatio | typeof ALL_RATIOS>(ALL_RATIOS)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Mọi nút ghi trong pool đều đọc cờ này: đang chạy AI thì khoá tạm, bài đã đăng thì khoá hẳn
  const isReadOnly = isBusy || isLocked

  const availableRatios = useMemo(() => [...new Set(imageJobs.map((job) => job.ratio))], [imageJobs])
  const visibleJobs = ratioFilter === ALL_RATIOS ? imageJobs : imageJobs.filter((job) => job.ratio === ratioFilter)
  const activeDraft = channelDrafts.find((channelDraft) => channelDraft.channel === activeChannel)
  // Đếm trên toàn pool chứ không theo bộ lọc tỉ lệ: nút thử lại hàng loạt chạy cho mọi ô lỗi
  const failedJobCount = imageJobs.filter((job) => job.status === MarketingStudioJobStatus.Failed).length

  // Lật ảnh trong lightbox đi đúng thứ tự lưới đang thấy, nên bỏ qua ô đang chạy và ô cắt lỗi
  const zoomableImages = visibleJobs.flatMap((job) => {
    if (job.status !== MarketingStudioJobStatus.Done) return []

    const poolImage = pool.find((item) => item.id === job.id)

    return poolImage ? [resolveChannelImage(poolImage, activeDraft)] : []
  })

  return (
    <section className='flex min-h-0 flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm'>
      <div className='space-y-2'>
        <h2 className='font-bold'>{t('marketingPosts.studio.pool.title')}</h2>

        <div className='flex flex-wrap gap-1.5'>
          <MarketingStudioImageAdder isBusy={isReadOnly} onAddSourceImages={onAddSourceImages} />
          <MarketingStudioRatioAdder
            isBusy={isReadOnly}
            sourceImages={sourceImages}
            onAddImageRatios={onAddImageRatios}
          />
          {failedJobCount > 1 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isReadOnly}
              onClick={onRetryFailedImages}
              className='h-7 border-destructive/40 px-2 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive'
            >
              <RefreshCwIcon className='size-3' />
              {t('marketingPosts.studio.pool.retryAll', { count: failedJobCount })}
            </Button>
          )}
        </div>

        {/* Ô tick là của riêng kênh đang mở - nói rõ ra, không thì dễ tưởng ba kênh dùng chung */}
        {activeChannel && (
          <p className='rounded-lg bg-muted/60 px-2 py-1 text-xs text-muted-foreground'>
            {isLocked
              ? t('marketingPosts.studio.pool.lockedFor', {
                  channel: t(`marketingPosts.channel.${activeChannel}`)
                })
              : t('marketingPosts.studio.pool.selectingFor', {
                  channel: t(`marketingPosts.channel.${activeChannel}`)
                })}
          </p>
        )}
      </div>

      {availableRatios.length > 1 && (
        <div className='flex flex-wrap gap-1.5'>
          {[ALL_RATIOS, ...availableRatios].map((ratio) => (
            <button
              key={ratio}
              type='button'
              aria-pressed={ratioFilter === ratio}
              onClick={() => setRatioFilter(ratio as MarketingPostImageRatio | typeof ALL_RATIOS)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] transition-colors hover:bg-muted',
                ratioFilter === ratio && 'border-primary bg-primary/10 text-primary hover:bg-primary/10'
              )}
            >
              {ratio === ALL_RATIOS ? t('marketingPosts.studio.pool.allRatios') : ratio}
            </button>
          ))}
        </div>
      )}

      <div className='columns-2 gap-2 [&>*]:mb-2 [&>*]:break-inside-avoid'>
        {visibleJobs.map((job) => {
          if (job.status === MarketingStudioJobStatus.Failed) {
            return <FailedTile key={job.id} job={job} isBusy={isReadOnly} onRetry={() => onRegenerateImage(job.id)} />
          }

          const poolImage = pool.find((item) => item.id === job.id)
          if (!poolImage || job.status !== MarketingStudioJobStatus.Done) {
            return <PendingTile key={job.id} job={job} />
          }

          // Ô ảnh hiện đúng bản mà kênh đang mở đang dùng, không phải bản mới nhất của pool
          const image = resolveChannelImage(poolImage, activeDraft)

          const selectedIndex = activeDraft?.imageIds.indexOf(job.id) ?? -1

          return (
            <PoolTile
              key={job.id}
              image={image}
              isBusy={isReadOnly}
              order={selectedIndex >= 0 ? selectedIndex + 1 : null}
              usedByChannels={channelDrafts
                .filter((channelDraft) => channelDraft.imageIds.includes(job.id))
                .map((channelDraft) => channelDraft.channel)}
              hasRatioWarning={activeChannel ? !isPreferredRatio(activeChannel, image.ratio) : false}
              onToggle={() => onToggleImage(job.id)}
              onZoom={() => setLightboxIndex(zoomableImages.findIndex((item) => item.id === job.id))}
              onRegenerate={(request) => onRegenerateImage(job.id, request)}
              onSelectVersion={(attempt) => onSelectImageVersion(job.id, attempt)}
              // Chỉ gợi ý tỉ lệ mà ảnh gốc này chưa cắt, khỏi đẻ ô trùng
              missingRatios={marketingPostImageRatios.filter(
                (item) => !pool.some((entry) => entry.sourceIndex === poolImage.sourceIndex && entry.ratio === item)
              )}
              onCloneRatio={(ratio) => onCloneRatio(job.id, ratio)}
            />
          )
        })}
      </div>

      {imageJobs.length === 0 && (
        <p className='rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground'>
          {t('marketingPosts.studio.pool.empty')}
        </p>
      )}

      <ImageLightbox
        slides={zoomableImages.map((image) => ({
          src: image.url,
          alt: image.sourceName,
          description: t('marketingPosts.studio.pool.caption', { name: image.sourceName, ratio: image.ratio })
        }))}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        label={t('marketingPosts.studio.lightbox.pool')}
      />
    </section>
  )
}

export default MarketingStudioImagePool
