import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Field, FieldError } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeftIcon, ChevronDownIcon } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { Controller } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { marketingPostChannelPresets } from '../features/marketing-posts/channel-presets'
import MarketingPostMarkdown from '../features/marketing-posts/components/marketing-post-markdown'
import MarketingPostTemplatePicker from '../features/marketing-posts/components/marketing-post-template-picker'
import { useWatch } from 'react-hook-form'
import MarketingPostRatioPicker from '../features/marketing-posts/components/marketing-post-ratio-picker'
import MarketingPostSystemPromptDrawer from '../features/marketing-posts/components/marketing-post-system-prompt-drawer'
import { useSelectMarketingChannels } from '../features/marketing-posts/hooks/use-select-marketing-channels'
import { countMarketingImageBatches, countMarketingImagePairs } from '../features/marketing-posts/validations'
import { marketingPostChannels } from '../features/marketing-posts/mock-data'
import { MarketingPostPlatform, type MarketingPostChannel } from '../features/marketing-posts/types'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

function ChannelCard({
  channel,
  isSelected,
  onToggle
}: {
  channel: MarketingPostChannel
  isSelected: boolean
  onToggle: (isSelected: boolean) => void
}) {
  const { t } = useTenantTranslation()
  const channelLabel = t(`marketingPosts.channel.${channel}`)
  // Phải tự giữ state đóng/mở. Truyền `isSelected` vào `defaultOpen` thì Radix thấy giá trị mặc
  // định đổi sau khi mount, reset state nội bộ và văng "Maximum update depth exceeded".
  const [isOpen, setIsOpen] = useState(isSelected)

  // Radix Checkbox bắn thêm một click lên input ẩn để form nghe được, click đó bubble lên hàng
  // thẻ rồi toggle ngược lại thành vòng lặp vô hạn - nên bỏ qua click phát ra từ chính ô tick.
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('[data-slot="checkbox"]')) return

    onToggle(!isSelected)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', isSelected && 'border-primary/40')}
    >
      <div
        onClick={handleRowClick}
        className='flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors select-none hover:bg-muted/40'
      >
        <div
          aria-hidden='true'
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          {channelLabel.charAt(0)}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium'>{channelLabel}</p>
          <p className='truncate text-xs text-muted-foreground'>{t(`marketingPosts.channelAccount.${channel}`)}</p>
        </div>

        <Checkbox
          id={`channel-${channel}`}
          aria-label={channelLabel}
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />

        <CollapsibleTrigger asChild>
          {/* Mở xem prompt thì không được kéo theo việc chọn nền tảng */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={(event) => event.stopPropagation()}
            className='group/collapsible size-8'
          >
            <ChevronDownIcon className='transition-transform group-data-[state=open]/collapsible:rotate-180' />
            <span className='sr-only'>{t('common.ui.toggle')}</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className='space-y-3 border-t px-5 py-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <MarketingPostSystemPromptDrawer channel={channel} />
            <Badge
              variant='outline'
              className='border-emerald-200 bg-emerald-50 font-normal text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
            >
              {t('marketingPosts.create.channel.configured')}
            </Badge>
          </div>

          {/* Xem trước vài dòng đầu, đọc kỹ thì mở drawer */}
          <MarketingPostMarkdown
            source={t(marketingPostChannelPresets[channel].promptKey)}
            className='line-clamp-3 text-muted-foreground'
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function MarketingPostPlatformsPage() {
  const { t } = useTenantTranslation()
  const { postId } = useParams()
  const { marketingPost, isGettingMarketingPost, methods, onSubmit } = useSelectMarketingChannels(postId)
  const selectedChannels = useWatch({ control: methods.control, name: 'channels' })
  const templates = useWatch({ control: methods.control, name: 'templates' })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  if (isGettingMarketingPost) {
    return (
      <div className='mx-auto w-full max-w-3xl space-y-6 px-6 py-6'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-24 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
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

        <div className='space-y-3 rounded-xl border border-dashed p-10 text-center'>
          <p className='text-sm text-muted-foreground'>{t('marketingPosts.detail.notFound')}</p>
          <Button asChild size='sm'>
            <Link to={`${POSTS_PATH}/create`}>{t('marketingPosts.create.title')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isBusy = isSubmitting
  const baseImages = [...marketingPost.baseImages].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='h-full overflow-auto'>
      <div className='mx-auto w-full max-w-3xl px-6 py-6'>
        <Button type='button' variant='ghost' size='sm' asChild className='mb-4'>
          <Link to={`${POSTS_PATH}/create`}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('marketingPosts.create.backToContent')}
          </Link>
        </Button>

        <div className='mb-6'>
          <p className='text-xs font-medium text-primary'>{t('marketingPosts.create.stepTwo')}</p>
          <h1 className='mt-1 text-2xl font-bold'>{t('marketingPosts.create.stepTwoTitle')}</h1>
          <p className='mt-0.5 text-sm text-muted-foreground'>{t('marketingPosts.create.channelsHint')}</p>
        </div>

        {/* Nhắc lại bài gốc vừa lưu, khỏi phải quay về mới nhớ đang sinh nội dung cho bài nào */}
        <div className='mb-6 rounded-2xl border bg-muted/30 p-4'>
          <p className='font-medium'>{marketingPost.title}</p>
          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>{marketingPost.content}</p>
          <p className='mt-2 text-xs text-muted-foreground'>
            {t('marketingPosts.create.sourceSummary', { images: marketingPost.baseImages.length })}
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='mb-3 font-bold'>{t('marketingPosts.create.section.channels')}</h2>

          <Controller
            name='channels'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-3'>
                <div className='space-y-3'>
                  {marketingPostChannels.map((channel) => (
                    <ChannelCard
                      key={channel}
                      channel={channel}
                      isSelected={field.value.includes(channel)}
                      onToggle={(isSelected) =>
                        field.onChange(
                          isSelected
                            ? [...field.value, channel]
                            : field.value.filter((selected) => selected !== channel)
                        )
                      }
                    />
                  ))}
                </div>

                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {selectedChannels.map((channel) => (
          <div key={channel} className='mb-4 space-y-2'>
            <h2 className='text-sm font-medium'>{t(`marketingPosts.channel.${channel}`)}</h2>
            <MarketingPostTemplatePicker
              platform={channel === 'zaloOa' ? MarketingPostPlatform.Zalo : channel}
              images={baseImages}
              value={templates?.[channel] ?? null}
              onChange={(value) => {
                const next = { ...methods.getValues('templates') }
                if (value) next[channel] = value
                else delete next[channel]
                methods.setValue('templates', next, { shouldValidate: false })
              }}
            />
          </div>
        ))}

        <Controller
          name='images'
          control={control}
          render={({ field, fieldState }) => {
            const totalPairs = countMarketingImagePairs(field.value)
            const totalBatches = countMarketingImageBatches(field.value)

            return (
              <Field
                data-invalid={fieldState.invalid}
                className={cn(
                  'mb-6 gap-3',
                  selectedChannels.length > 0 && selectedChannels.every((channel) => templates?.[channel]) && 'hidden'
                )}
              >
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <h2 className='font-bold'>{t('marketingPosts.create.section.ratios')}</h2>
                  {field.value.length > 0 && (
                    <Badge variant='secondary' className='font-normal'>
                      {totalBatches > 1
                        ? t('marketingPosts.create.field.totalOutputsBatched', {
                            outputs: totalPairs,
                            batches: totalBatches
                          })
                        : t('marketingPosts.create.field.totalOutputs', { outputs: totalPairs })}
                    </Badge>
                  )}
                </div>

                {baseImages.map((image, index) => {
                  const selected = field.value.find((current) => current.id === image.id)

                  return (
                    <div key={image.id} className='rounded-2xl border bg-card p-4 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <img
                          src={image.imageUrl}
                          alt={t('marketingPosts.detail.imageAlt', { index: index + 1 })}
                          className='size-14 shrink-0 rounded-lg border bg-muted/40 object-cover'
                        />
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium'>
                            {t('marketingPosts.detail.imageAlt', { index: index + 1 })}
                          </p>
                          {image.width && image.height && (
                            <p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>
                              {image.width} × {image.height}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className='mt-3'>
                        <MarketingPostRatioPicker
                          value={selected?.ratios ?? []}
                          onChange={(ratios) =>
                            field.onChange(
                              field.value.map((current) => (current.id === image.id ? { ...current, ratios } : current))
                            )
                          }
                        />
                        {selected && selected.ratios.length === 0 && (
                          <p className='mt-2 text-xs text-destructive'>
                            {t('marketingPosts.validation.images.ratioRequired')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Field>
            )
          }}
        />

        <div className='mt-6 flex justify-end'>
          <Button
            type='submit'
            disabled={
              isBusy ||
              selectedChannels.some(
                (channel) =>
                  templates?.[channel] &&
                  (!templates[channel]?.templateId || templates[channel]?.sourceImageIds.some((id) => !id))
              )
            }
          >
            {isBusy && <Spinner />}
            {t('marketingPosts.create.submit')}
          </Button>
        </div>
      </div>
    </form>
  )
}
