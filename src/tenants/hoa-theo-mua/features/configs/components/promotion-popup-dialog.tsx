import { DatePickerField } from '@/components/date-picker-field'
import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { decodeImageViewport, encodeImageViewport, type ImageViewport } from '@/lib/image-viewport'
import { MAX_UPLOAD_IMAGE_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ExternalLink,
  ImageIcon,
  Info,
  LinkIcon,
  Plus,
  SaveIcon,
  Trash2,
  TriangleAlert,
  UploadIcon
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  businessToday,
  campaignStatus,
  countLiveCampaigns,
  defaultPromotionCampaign,
  defaultPromotionPopup,
  MAX_VISIBLE_CAMPAIGNS,
  parsePromotionPopup,
  pickerValueToYmd,
  POPUP_FREQUENCIES,
  PROMOTION_POPUP_GROUP,
  PROMOTION_POPUP_IMAGE_ASPECT,
  PROMOTION_POPUP_KEY,
  ymdToPickerValue,
  type CampaignStatus,
  type PromotionCampaign,
  type PromotionPopupCollection
} from '../promotion-popup-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import { promotionPopupFormSchema, type CreateConfigFormValues, type PromotionPopupFormValues } from '../validations'
import { LocalizedTabs } from './collection-shared'
import { PromotionPagesField } from './promotion-pages-field'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

const STATUS_TONES: Record<CampaignStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  scheduled: 'border-sky-200 bg-sky-50 text-sky-700',
  expired: 'border-muted bg-muted text-muted-foreground',
  disabled: 'border-muted bg-muted text-muted-foreground',
  incomplete: 'border-amber-200 bg-amber-50 text-amber-700'
}

// `frequency` and `pages` pass through untouched to avoid dropping raw-JSON scoping.
const toFormValues = (collection: PromotionPopupCollection): PromotionPopupFormValues => ({
  section: collection.section,
  items: collection.items.map((item) => ({
    ...item,
    startDate: ymdToPickerValue(item.startDate),
    endDate: ymdToPickerValue(item.endDate)
  }))
})

const emptyCampaignFormValue = () => {
  const campaign = defaultPromotionCampaign()
  return { ...campaign, startDate: null, endDate: null }
}

export default function PromotionPopupDialog({ open, onClose, existingConfig }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const schema = useMemo(() => promotionPopupFormSchema(t), [t])
  const methods = useForm<PromotionPopupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(defaultPromotionPopup())
  })
  const { control, handleSubmit, reset } = methods
  const { fields, append, remove, swap } = useFieldArray({ control, name: 'items' })

  // Keyed by field id so staged files survive reorder and orphan on remove.
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  // Staged files only have a blob: URL, which can't carry a viewport, so it's held here until upload.
  const [pendingViewports, setPendingViewports] = useState<Record<string, ImageViewport | null>>({})
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const today = useMemo(() => businessToday(), [])

  useEffect(() => {
    if (!open) return
    const initial = existingConfig ? parsePromotionPopup(existingConfig.value.value) : defaultPromotionPopup()
    reset(toFormValues(initial))
    setPendingFiles({})
    setPendingViewports({})
    setPendingPreviews((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url))
      return {}
    })
    setOpenItemIds([])
  }, [open, existingConfig, reset])

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const watchedSection = useWatch({ control, name: 'section' })
  const watchedItems = useWatch({ control, name: 'items' })

  // Staged files count as images; route scope is ignored since there's no current page while authoring.
  const activeCount = useMemo(() => {
    const items: PromotionCampaign[] = (watchedItems ?? []).map((item, index) => ({
      ...(item as PromotionCampaign),
      image: item.image || (pendingFiles[fields[index]?.id] ? 'pending' : ''),
      startDate: pickerValueToYmd(item.startDate),
      endDate: pickerValueToYmd(item.endDate)
    }))
    return countLiveCampaigns({ section: { ...defaultPromotionPopup().section, ...watchedSection }, items }, today)
  }, [watchedItems, watchedSection, pendingFiles, fields, today])

  const clearPendingFile = useCallback((fieldId: string) => {
    setPendingPreviews((prev) => {
      if (prev[fieldId]) URL.revokeObjectURL(prev[fieldId])
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
    setPendingFiles((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
    setPendingViewports((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const setPendingFileForItem = (fieldId: string, file: File) => {
    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      toast.error(t('configsPage.promotionPopupDialog.errors.imageTooLarge', { max: MAX_UPLOAD_IMAGE_SIZE / 1048576 }))
      return
    }
    setPendingFiles((prev) => ({ ...prev, [fieldId]: file }))
    // A new picture resets the viewport rather than reusing the old one's framing.
    setPendingViewports((prev) => ({ ...prev, [fieldId]: null }))
    setPendingPreviews((prev) => {
      if (prev[fieldId]) URL.revokeObjectURL(prev[fieldId])
      return { ...prev, [fieldId]: URL.createObjectURL(file) }
    })
  }

  // useFieldArray assigns the row's id after append, so the expand is deferred an effect.
  const autoOpenLastRef = useRef(false)

  const addItem = () => {
    autoOpenLastRef.current = true
    append(emptyCampaignFormValue())
  }

  useEffect(() => {
    if (!autoOpenLastRef.current || fields.length === 0) return
    autoOpenLastRef.current = false
    setOpenItemIds((prev) => [...prev, fields[fields.length - 1].id])
  }, [fields])

  const removeItem = (index: number) => {
    const fieldId = fields[index]?.id
    if (fieldId) clearPendingFile(fieldId)
    remove(index)
  }

  const onSubmit = handleSubmit(async (values) => {
    // Staged files are not form state, so image presence is checked here.
    for (let i = 0; i < values.items.length; i++) {
      const fieldId = fields[i]?.id
      if (!values.items[i].image && !(fieldId && pendingFiles[fieldId])) {
        toast.error(t('configsPage.promotionPopupDialog.errors.imageRequired', { index: i + 1 }))
        return
      }
    }

    setIsSaving(true)
    try {
      const items: PromotionCampaign[] = []
      for (let i = 0; i < values.items.length; i++) {
        const item = values.items[i]
        const fieldId = fields[i]?.id
        const pending = fieldId ? pendingFiles[fieldId] : undefined

        let image = item.image
        if (pending) {
          const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          // encodeImageViewport refuses blob: URLs, so the viewport can only be written once the image has a real URL.
          image = encodeImageViewport(url, fieldId ? pendingViewports[fieldId] : null)
        }

        items.push({
          id: item.id,
          image,
          href: item.href.trim(),
          openInNewTab: item.openInNewTab,
          alt: item.alt,
          startDate: pickerValueToYmd(item.startDate),
          endDate: pickerValueToYmd(item.endDate),
          enabled: item.enabled,
          pages: item.pages
        })
      }

      const resolved: PromotionPopupCollection = { section: values.section, items }

      const body: CreateConfigFormValues = {
        key: PROMOTION_POPUP_KEY,
        isPublic: true,
        group: PROMOTION_POPUP_GROUP,
        kind: ConfigKind.content,
        value: {
          group: PROMOTION_POPUP_GROUP,
          label: t('configsPage.promotionPopupDialog.configLabel'),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          value: JSON.stringify(resolved)
        }
      }

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      queryClient.invalidateQueries({ queryKey: ['configs'] })
      onClose()
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  })

  const submitting = isSaving || isUploading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent
        position='top-center'
        className='flex min-w-5xl flex-col gap-0 p-0 overflow-hidden'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 pt-6 pb-3'>
          <DialogTitle>{t('configsPage.promotionPopupDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.promotionPopupDialog.subtitle')}</p>
        </DialogHeader>

        <FormProvider {...methods}>
          <form id='promotion-popup-form' onSubmit={onSubmit} className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto px-6 pb-4'>
              <div className='flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2'>
                <Info className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
                <p className='text-xs text-amber-800'>{t('configsPage.promotionPopupDialog.publicWarning')}</p>
              </div>

              <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-semibold'>{t('configsPage.promotionPopupDialog.section.title')}</div>
                    <div className='text-xs text-muted-foreground'>
                      {t('configsPage.promotionPopupDialog.section.subtitle')}
                    </div>
                  </div>
                  <Controller
                    name='section.enabled'
                    control={control}
                    render={({ field }) => (
                      <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                        {t('configsPage.promotionPopupDialog.section.enabled')}
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </Label>
                    )}
                  />
                </div>

                <div className='mt-4 space-y-4 border-t pt-4'>
                  {/* Two-option select sits beside its explanation. */}
                  <Controller
                    name='section.frequency'
                    control={control}
                    render={({ field }) => (
                      <div className='space-y-0.5'>
                        <FieldLabel>{t('configsPage.promotionPopupDialog.section.frequencyField')}</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger size='sm' className='w-56 shrink-0 text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {POPUP_FREQUENCIES.map((frequency) => (
                              <SelectItem key={frequency} value={frequency}>
                                {t(`configsPage.promotionPopupDialog.section.frequency.${frequency}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription className='min-w-0 flex-1 text-xs'>
                          {t(`configsPage.promotionPopupDialog.section.frequencyHelp.${field.value}`)}
                        </FieldDescription>
                      </div>
                    )}
                  />

                  <Controller
                    name='section.pages'
                    control={control}
                    render={({ field }) => (
                      <PromotionPagesField
                        label={t('configsPage.promotionPopupDialog.section.pagesField')}
                        description={t('configsPage.promotionPopupDialog.section.pagesHelp')}
                        value={field.value}
                        onChange={field.onChange}
                        error={methods.formState.errors.section?.pages?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className='mt-5 flex items-center justify-between'>
                <div>
                  <div className='text-sm font-semibold'>{t('configsPage.promotionPopupDialog.items.title')}</div>
                  <div className='text-xs text-muted-foreground'>
                    {t('configsPage.promotionPopupDialog.items.subtitle', {
                      count: fields.length,
                      active: activeCount
                    })}
                  </div>
                </div>
                <Button type='button' variant='outline' size='sm' onClick={addItem}>
                  <Plus className='size-3.5' data-icon='inline-start' />
                  {t('configsPage.promotionPopupDialog.items.add')}
                </Button>
              </div>

              {activeCount > MAX_VISIBLE_CAMPAIGNS && (
                <div className='mt-3 flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2'>
                  <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
                  <p className='text-xs text-amber-800'>
                    {t('configsPage.promotionPopupDialog.activeWarning', {
                      max: MAX_VISIBLE_CAMPAIGNS,
                      count: activeCount
                    })}
                  </p>
                </div>
              )}

              {fields.length === 0 ? (
                <div className='mt-4 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
                  {t('configsPage.promotionPopupDialog.items.empty')}
                </div>
              ) : (
                <Accordion
                  type='multiple'
                  value={openItemIds}
                  onValueChange={setOpenItemIds}
                  className='mt-3 space-y-2 rounded-2xl'
                >
                  {fields.map((field, index) => (
                    <CampaignRow
                      key={field.id}
                      fieldId={field.id}
                      index={index}
                      total={fields.length}
                      today={today}
                      sectionPages={watchedSection?.pages ?? []}
                      pendingPreviewUrl={pendingPreviews[field.id]}
                      pendingViewport={pendingViewports[field.id] ?? null}
                      onPendingViewportChange={(viewport) =>
                        setPendingViewports((prev) => ({ ...prev, [field.id]: viewport }))
                      }
                      onRemove={() => removeItem(index)}
                      onMove={(dir) => {
                        const to = index + dir
                        if (to >= 0 && to < fields.length) swap(index, to)
                      }}
                      onPickFile={(file) => setPendingFileForItem(field.id, file)}
                      onClearPendingFile={() => clearPendingFile(field.id)}
                    />
                  ))}
                </Accordion>
              )}
            </div>

            <DialogFooter className='border-t px-6 py-4'>
              {/* Config deletion is temporarily disabled for safety - the button stays visible but inert. */}
              {existingConfig && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='mr-auto inline-flex'>
                      <Button type='button' variant='destructive' disabled className='pointer-events-none'>
                        <Trash2 className='size-3.5' />
                        {t('configsPage.dialog.delete')}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t('configsPage.dialog.deleteDisabledTooltip')}</TooltipContent>
                </Tooltip>
              )}
              <Button type='button' variant='outline' disabled={submitting} onClick={onClose}>
                {t('configsPage.dialog.cancel')}
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
                {submitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

function CampaignRow({
  fieldId,
  index,
  total,
  today,
  sectionPages,
  pendingPreviewUrl,
  pendingViewport,
  onPendingViewportChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile
}: {
  fieldId: string
  index: number
  total: number
  today: string
  sectionPages: string[]
  pendingPreviewUrl?: string
  pendingViewport: ImageViewport | null
  onPendingViewportChange: (viewport: ImageViewport | null) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}) {
  const { t } = useTenantTranslation()
  const { control, register, setValue, formState } = useFormContext<PromotionPopupFormValues>()
  const fileRef = useRef<HTMLInputElement>(null)

  const item = useWatch({ control, name: `items.${index}` })
  const itemErrors = formState.errors.items?.[index]

  const displayPreview = pendingPreviewUrl || item?.image || ''

  const isStaged = Boolean(pendingPreviewUrl)
  const viewport = isStaged ? pendingViewport : decodeImageViewport(item?.image ?? '').viewport

  const handleViewportChange = (next: ImageViewport | null) => {
    if (isStaged) onPendingViewportChange(next)
    else setValue(`items.${index}.image`, encodeImageViewport(item?.image ?? '', next), { shouldDirty: true })
  }
  // `alt.vi` doubles as the row label.
  const displayLabel =
    item?.alt?.vi?.trim() || t('configsPage.promotionPopupDialog.item.untitled', { index: index + 1 })
  const status = campaignStatus(
    {
      ...(item as PromotionCampaign),
      image: displayPreview,
      startDate: pickerValueToYmd(item?.startDate),
      endDate: pickerValueToYmd(item?.endDate)
    },
    today
  )

  return (
    <AccordionItem value={fieldId} className='border-b-transparent'>
      <div className='flex w-full items-center gap-2 rounded-xl border bg-muted'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='h-12 w-10 shrink-0 rounded-lg border bg-muted'
              fallback={
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              }
            />
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='truncate text-sm font-medium'>{displayLabel}</span>
              <span className='flex items-center gap-1 truncate text-xs text-muted-foreground'>
                {item?.href ? (
                  <>
                    {item.openInNewTab ? <ExternalLink className='size-3' /> : <LinkIcon className='size-3' />}
                    <span className='truncate'>{item.href}</span>
                  </>
                ) : (
                  t('configsPage.promotionPopupDialog.item.noHref')
                )}
              </span>
            </div>
            {itemErrors && (
              <Badge
                variant='outline'
                className='border-destructive/40 bg-destructive/10 text-destructive text-[0.625rem]'
              >
                {t('configsPage.promotionPopupDialog.item.hasErrors')}
              </Badge>
            )}
            <Badge variant='outline' className={cn('text-[0.625rem]', STATUS_TONES[status])}>
              {t(`configsPage.promotionPopupDialog.item.status.${status}`)}
            </Badge>
            <ChevronsUpDown className='size-3.5 text-muted-foreground' />
          </div>
        </AccordionTrigger>

        <div className='mr-2 flex items-center gap-0.5'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('configsPage.promotionPopupDialog.item.moveUp')}
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
            aria-label={t('configsPage.promotionPopupDialog.item.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Controller
            name={`items.${index}.enabled`}
            control={control}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} className='ml-1' />}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.promotionPopupDialog.item.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='rounded-b-2xl p-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]'>
          <div className='space-y-2'>
            <FieldLabel className='text-xs'>{t('configsPage.promotionPopupDialog.item.image')}</FieldLabel>
            {/* 4:5 matches the box the storefront reserves, so this is the real crop. */}
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='mt-1 aspect-[4/5] rounded-lg border bg-muted'
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

            <div className='mt-2 flex items-center gap-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full flex-1'
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon data-icon='inline-start' />
                {displayPreview
                  ? t('configsPage.promotionPopupDialog.item.replaceImage')
                  : t('configsPage.promotionPopupDialog.item.uploadImage')}
              </Button>

              <ImageViewportButton
                src={displayPreview}
                viewport={viewport}
                onViewportChange={handleViewportChange}
                aspectRatio={PROMOTION_POPUP_IMAGE_ASPECT}
                size='icon-sm'
              />

              {displayPreview && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    setValue(`items.${index}.image`, '', { shouldDirty: true })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>

            <FieldDescription className='text-xs'>
              {t('configsPage.promotionPopupDialog.item.imageHelp')}
            </FieldDescription>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {/* Tenant namespace keys are untyped strings; the shared field takes base I18nKey. */}
              <DatePickerField<PromotionPopupFormValues>
                control={control}
                name={`items.${index}.startDate`}
                label={'configsPage.promotionPopupDialog.item.startDate' as I18nKey}
                placeholder={'configsPage.promotionPopupDialog.item.datePlaceholder' as I18nKey}
              />

              <DatePickerField<PromotionPopupFormValues>
                control={control}
                name={`items.${index}.endDate`}
                label={'configsPage.promotionPopupDialog.item.endDate' as I18nKey}
                placeholder={'configsPage.promotionPopupDialog.item.datePlaceholder' as I18nKey}
              />
            </div>

            <FieldDescription className='-mt-2 text-xs'>
              {t('configsPage.promotionPopupDialog.item.datesHelp')}
            </FieldDescription>

            <Field data-invalid={Boolean(itemErrors?.href)} className='gap-1'>
              <FieldLabel>{t('configsPage.promotionPopupDialog.item.hrefField')}</FieldLabel>
              <Input
                {...register(`items.${index}.href`)}
                placeholder={t('configsPage.promotionPopupDialog.item.hrefPlaceholder')}
                aria-invalid={Boolean(itemErrors?.href)}
              />
              {itemErrors?.href ? (
                <FieldError className='text-xs' errors={[itemErrors.href]} />
              ) : (
                <FieldDescription className='text-xs'>
                  {t('configsPage.promotionPopupDialog.item.hrefHelp')}
                </FieldDescription>
              )}
            </Field>

            <Controller
              name={`items.${index}.openInNewTab`}
              control={control}
              render={({ field }) => (
                <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  {t('configsPage.promotionPopupDialog.item.openInNewTabToggle')}
                </Label>
              )}
            />

            <LocalizedTabs
              viLabel={t('configsPage.promotionPopupDialog.locale.vi')}
              enLabel={t('configsPage.promotionPopupDialog.locale.en')}
              renderField={(lang) => (
                <Field data-invalid={lang === 'vi' && Boolean(itemErrors?.alt?.vi)} className='gap-1'>
                  <FieldLabel>{t('configsPage.promotionPopupDialog.item.altField')}</FieldLabel>
                  <Input
                    {...register(`items.${index}.alt.${lang}`)}
                    placeholder={t('configsPage.promotionPopupDialog.item.altPlaceholder')}
                    aria-invalid={lang === 'vi' && Boolean(itemErrors?.alt?.vi)}
                  />
                  {lang === 'vi' && itemErrors?.alt?.vi ? (
                    <FieldError className='text-xs' errors={[itemErrors.alt.vi]} />
                  ) : (
                    <FieldDescription className='text-xs'>
                      {t('configsPage.promotionPopupDialog.item.altHelp')}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name={`items.${index}.pages`}
              control={control}
              render={({ field }) => (
                <PromotionPagesField
                  label={t('configsPage.promotionPopupDialog.item.pagesField')}
                  description={t('configsPage.promotionPopupDialog.item.pagesHelp')}
                  value={field.value}
                  onChange={field.onChange}
                  inheritedFrom={sectionPages}
                  error={itemErrors?.pages?.message}
                />
              )}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
