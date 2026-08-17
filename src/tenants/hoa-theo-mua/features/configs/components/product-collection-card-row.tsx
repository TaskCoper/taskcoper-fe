import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import { decodeImageViewport, encodeImageViewport, type ImageViewport } from '@/lib/image-viewport'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, ChevronsUpDown, ImageIcon, Trash2, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { PRODUCT_COLLECTION_IMAGE_ASPECT, slugify } from '../product-collection-palette'
import type { ProductCollectionFormValues } from '../validations'
import { ChipInput, LocalizedTabs } from './collection-shared'
// Campaign UI temporarily disabled — see the commented section at the bottom of this file.
// import ProductCollectionCampaignsSection from './product-collection-campaigns-section'

type Lang = 'vi' | 'en'

interface Props {
  fieldId: string
  index: number
  total: number
  pendingPreviewUrl?: string
  pendingViewport: ImageViewport | null
  onPendingViewportChange: (viewport: ImageViewport | null) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}

export default function ProductCollectionCardRow({
  fieldId,
  index,
  total,
  pendingPreviewUrl,
  pendingViewport,
  onPendingViewportChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile
}: Props) {
  const { t } = useTenantTranslation()
  const { control, register, setValue, getValues } = useFormContext<ProductCollectionFormValues>()
  const fileRef = useRef<HTMLInputElement>(null)

  const card = useWatch({ control, name: `cards.${index}` })
  // const hasCampaigns = useWatch({ control, name: 'hasCampaigns' })

  const displayPreview = pendingPreviewUrl || card?.image || ''

  const isStaged = Boolean(pendingPreviewUrl)
  const viewport = isStaged ? pendingViewport : decodeImageViewport(card?.image ?? '').viewport

  const handleViewportChange = (next: ImageViewport | null) => {
    if (isStaged) onPendingViewportChange(next)
    else setValue(`cards.${index}.image`, encodeImageViewport(card?.image ?? '', next), { shouldDirty: true })
  }
  const displayName = card?.name.vi || t('configsPage.productCollectionDialog.card.untitled', { index: index + 1 })

  const handleNameBlur = (lang: Lang, value: string) => {
    if (lang !== 'vi' || card?.id) return
    const otherIds = new Set(
      getValues('cards')
        .map((c) => c.id)
        .filter((_, i) => i !== index)
    )
    let candidate = slugify(value) || `card-${index + 1}`
    let n = 2
    while (otherIds.has(candidate)) candidate = `${slugify(value) || 'card'}-${n++}`
    setValue(`cards.${index}.id`, candidate, { shouldValidate: true })
  }

  return (
    <AccordionItem value={fieldId} className='border-b-transparent'>
      <div className='flex items-center gap-2 border rounded-xl bg-muted w-full'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='size-10 shrink-0 rounded-lg border bg-muted'
              fallback={
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              }
            />
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='truncate text-sm font-medium'>{displayName}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {card?.id ? `/${card.id}` : t('configsPage.productCollectionDialog.card.noSlug')}
              </span>
            </div>

            {!card?.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.productCollectionDialog.card.disabled')}
              </Badge>
            )}
            <ChevronsUpDown className='size-3.5 text-muted-foreground' />
          </div>
        </AccordionTrigger>

        <div className='flex items-center gap-0.5 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('configsPage.productCollectionDialog.card.moveUp')}
          >
            <ArrowUp className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={t('configsPage.productCollectionDialog.card.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Controller
            control={control}
            name={`cards.${index}.enabled`}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} className='ml-1' />}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.productCollectionDialog.card.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='p-4 rounded-b-2xl'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]'>
          <div>
            <FieldLabel className='text-xs'>{t('configsPage.productCollectionDialog.card.image')}</FieldLabel>
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='mt-1 aspect-[4/5] rounded-md border bg-muted'
              fallback={
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-6' />
                </div>
              }
            />
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) onPickFile(file)
              }}
            />
            <div className='mt-2 flex gap-1.5'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon className='size-3.5' data-icon='inline-start' />
                {displayPreview
                  ? t('configsPage.productCollectionDialog.card.replaceImage')
                  : t('configsPage.productCollectionDialog.card.uploadImage')}
              </Button>
              <ImageViewportButton
                src={displayPreview}
                viewport={viewport}
                onViewportChange={handleViewportChange}
                aspectRatio={PRODUCT_COLLECTION_IMAGE_ASPECT}
                size='icon-sm'
              />
              {(pendingPreviewUrl || card?.image) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    setValue(`cards.${index}.image`, '', { shouldDirty: true })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <LocalizedTabs
              viLabel={t('configsPage.productCollectionDialog.locale.vi')}
              enLabel={t('configsPage.productCollectionDialog.locale.en')}
              renderField={(lang) => (
                <div className='space-y-2'>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.productCollectionDialog.card.badgeField')}</FieldLabel>
                    <Input
                      {...register(`cards.${index}.badge.${lang}` as const)}
                      placeholder={t('configsPage.productCollectionDialog.card.badgePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.productCollectionDialog.card.nameField')}</FieldLabel>
                    <Input
                      {...register(`cards.${index}.name.${lang}` as const, {
                        onBlur: (e) => handleNameBlur(lang, e.target.value)
                      })}
                      placeholder={t('configsPage.productCollectionDialog.card.namePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.productCollectionDialog.card.descriptionField')}</FieldLabel>
                    <Textarea
                      rows={2}
                      {...register(`cards.${index}.description.${lang}` as const)}
                      placeholder={t('configsPage.productCollectionDialog.card.descriptionPlaceholder')}
                    />
                  </Field>
                </div>
              )}
            />

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.productCollectionDialog.card.slugField')}</FieldLabel>
              <Input {...register(`cards.${index}.id` as const)} className='font-mono text-sm' />
              <FieldDescription className='text-xs'>
                {t('configsPage.productCollectionDialog.card.slugHelp')}
              </FieldDescription>
            </Field>

            <Controller
              control={control}
              name={`cards.${index}.categoryIds`}
              render={({ field }) => (
                <Field className='gap-1'>
                  <FieldLabel>{t('configsPage.productCollectionDialog.card.categoryIdsField')}</FieldLabel>
                  <ChipInput
                    values={field.value}
                    onChange={field.onChange}
                    placeholder={t('configsPage.productCollectionDialog.card.categoryIdsPlaceholder')}
                  />
                  <FieldDescription className='text-xs'>
                    {t('configsPage.productCollectionDialog.card.categoryIdsHelp')}
                  </FieldDescription>
                </Field>
              )}
            />
          </div>
        </div>

        {/* {hasCampaigns && <ProductCollectionCampaignsSection cardIndex={index} />} */}
      </AccordionContent>
    </AccordionItem>
  )
}
