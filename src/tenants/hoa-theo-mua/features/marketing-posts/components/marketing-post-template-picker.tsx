import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useState } from 'react'
import {
  assignTemplateSource,
  useImageTemplates,
  type MarketingTemplateSelection,
  type MarketingImageTemplate
} from '../image-templates'
import { marketingPostRatiosByCode, marketingPostImageRatioSizes } from '../image-ratios'
import type { MarketingPostBaseImage, MarketingPostPlatform } from '../types'

export default function MarketingPostTemplatePicker({
  platform,
  images,
  value,
  onChange,
  disabled
}: {
  platform: MarketingPostPlatform
  images: MarketingPostBaseImage[]
  value: MarketingTemplateSelection | null
  onChange: (value: MarketingTemplateSelection | null) => void
  disabled?: boolean
}) {
  const { t } = useTenantTranslation()
  const { data: templates, isPending, isError, refetch } = useImageTemplates()
  const [count, setCount] = useState('all')
  const selected = templates?.find((item) => item.id === value?.templateId && item.platform === platform)
  const visible =
    templates?.filter(
      (item) => item.platform === platform && (count === 'all' || item.ratios.length === Number(count))
    ) ?? []
  const id = `use-image-template-${platform}`

  return (
    <section className='space-y-3 rounded-xl border bg-card p-4'>
      <div className='flex items-center gap-2'>
        <Checkbox
          id={id}
          checked={value !== null}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked ? { templateId: '', sourceImageIds: [] } : null)}
        />
        <label htmlFor={id} className='cursor-pointer text-sm font-medium'>
          {t('marketingPosts.templates.use')}
        </label>
      </div>
      {value !== null && (
        <>
          <p className='text-xs text-muted-foreground'>
            {t(
              platform === 'facebook' ? 'marketingPosts.templates.facebookNote' : 'marketingPosts.templates.orderNote'
            )}
          </p>
          {isPending && <Spinner />}
          {isError && (
            <div role='alert' className='text-sm text-destructive'>
              {t('marketingPosts.templates.loadError')}{' '}
              <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                {t('marketingPosts.templates.retry')}
              </Button>
            </div>
          )}
          {templates && (
            <>
              <label className='flex items-center gap-2 text-xs'>
                {t('marketingPosts.templates.filterCount')}
                <select
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                  disabled={disabled}
                  className='h-8 rounded-md border bg-background px-2'
                >
                  <option value='all'>{t('marketingPosts.templates.all')}</option>
                  {Array.from({ length: 10 }, (_, index) => (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className='grid max-h-96 grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3'
                role='group'
                aria-label={t('marketingPosts.templates.catalog')}
              >
                {visible.map((template) => (
                  <button
                    key={template.id}
                    type='button'
                    disabled={disabled || !template.canApply}
                    aria-pressed={selected?.id === template.id}
                    onClick={() =>
                      onChange({
                        templateId: template.id,
                        sourceImageIds: template.ratios.map((_, index) => images[index]?.id ?? '')
                      })
                    }
                    className={cn(
                      'space-y-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
                      selected?.id === template.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <TemplatePreview template={template} />
                    <p className='text-xs font-medium'>
                      {t(`marketingPosts.templates.family.${template.family}`)} · {template.ratios.length}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {template.ratios.map((code) => marketingPostRatiosByCode[code]).join(' · ')}
                    </p>
                    {!template.canApply && (
                      <p className='text-[10px] text-muted-foreground'>{t('marketingPosts.templates.unavailable')}</p>
                    )}
                  </button>
                ))}
              </div>
              {selected && (
                <div className='space-y-2 border-t pt-3'>
                  <p className='text-xs font-medium'>{t('marketingPosts.templates.assign')}</p>
                  {selected.ratios.map((code, index) => {
                    const image = images.find((item) => item.id === value.sourceImageIds[index])
                    return (
                      <div key={index} className='flex items-center gap-2'>
                        <span className='w-20 shrink-0 text-xs'>
                          {index + 1}. {marketingPostRatiosByCode[code]}
                          {platform === 'zalo' && selected.family === 'article' && index === 0 && (
                            <span className='block text-[10px] text-muted-foreground'>
                              {t('marketingPosts.templates.cover')}
                            </span>
                          )}
                        </span>
                        {image && <img src={image.imageUrl} alt='' className='size-10 rounded border object-cover' />}
                        <select
                          aria-label={t('marketingPosts.templates.slot', { index: index + 1 })}
                          value={value.sourceImageIds[index] ?? ''}
                          disabled={disabled}
                          onChange={(event) =>
                            onChange({
                              ...value,
                              sourceImageIds: assignTemplateSource(value.sourceImageIds, index, event.target.value)
                            })
                          }
                          className='h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm'
                        >
                          <option value=''>{t('marketingPosts.templates.missing')}</option>
                          {images.map((source, sourceIndex) => (
                            <option key={source.id} value={source.id}>
                              {t('marketingPosts.detail.imageAlt', { index: sourceIndex + 1 })}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                  {value.sourceImageIds.some((source) => !source) && (
                    <p role='alert' className='text-xs text-destructive'>
                      {t('marketingPosts.templates.missing')}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

function TemplatePreview({ template }: { template: MarketingImageTemplate }) {
  const lead = template.family === 'portraitLead' || template.family === 'landscapeLead'
  const portrait = template.family === 'portraitLead'
  const count = template.ratios.length
  return (
    <div className='flex h-24 items-center justify-center' aria-hidden='true'>
      <div
        className='grid h-full max-w-full gap-1'
        style={
          lead
            ? {
                aspectRatio: portrait ? `2/${count - 1}` : `${count - 1}/2`,
                gridTemplateColumns: `repeat(${portrait ? 2 : count - 1}, minmax(0,1fr))`,
                gridTemplateRows: `repeat(${portrait ? count - 1 : 2}, minmax(0,1fr))`
              }
            : { gridTemplateColumns: `repeat(${Math.min(count, count > 4 ? 4 : 2)}, minmax(0,1fr))` }
        }
      >
        {template.ratios.map((code, index) => {
          const { width, height } = marketingPostImageRatioSizes[marketingPostRatiosByCode[code]]
          return (
            <span
              key={index}
              style={
                lead
                  ? index === 0
                    ? {
                        gridRow: portrait ? `span ${count - 1}` : undefined,
                        gridColumn: portrait ? undefined : `span ${count - 1}`
                      }
                    : undefined
                  : { aspectRatio: `${width}/${height}` }
              }
              className='flex min-h-0 min-w-0 items-center justify-center rounded-sm bg-primary/15 px-2 text-[10px] text-primary'
            >
              {index + 1}
            </span>
          )
        })}
      </div>
    </div>
  )
}
