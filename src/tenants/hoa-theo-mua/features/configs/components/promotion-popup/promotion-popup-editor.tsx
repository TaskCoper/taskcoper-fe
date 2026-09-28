import { DatePickerField } from '@/components/date-picker-field'
import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  LinkIcon,
  Plus,
  Trash2,
  UploadIcon
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  PROMOTION_POPUP_GROUP,
  PROMOTION_POPUP_IMAGE_ASPECT,
  PROMOTION_POPUP_KEY,
  ymdToPickerValue,
  type CampaignStatus
} from '../../promotion-popup-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import {
  ConfigKind,
  InputType,
  POPUP_FREQUENCIES,
  type Config,
  type PromotionCampaign,
  type PromotionPopupCollection
} from '../../types'
import { promotionPopupFormSchema, type CreateConfigFormValues, type PromotionPopupFormValues } from '../../validations'
import EditorCallout from '../settings/editor-callout'
import { usePendingImages } from '../../hooks/use-pending-images'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'
import { LocalizedTabs } from '../shared/collection-shared'
import { PromotionPagesField } from './promotion-pages-field'

interface Props {
  /** `null` là tạo mới singleton; ngược lại sửa tại chỗ bản ghi đang có. */
  existingConfig: Config | null
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  onSaved?: () => void
}

const STATUS_TONES: Record<CampaignStatus, string> = {
  active:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  scheduled: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
  expired: 'border-muted bg-muted text-muted-foreground',
  disabled: 'border-muted bg-muted text-muted-foreground',
  incomplete:
    'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
}

// `frequency` và `pages` đi qua nguyên vẹn để không làm mất phần phạm vi viết thẳng bằng JSON.
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

export default function PromotionPopupEditor({ existingConfig, onBack, onSaved }: Props) {
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

  // Khoá theo field id để ảnh chờ upload sống sót qua reorder và tự mồ côi khi xoá hàng.
  const pending = usePendingImages()
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const today = useMemo(() => businessToday(), [])

  useEffect(() => {
    const initial = existingConfig ? parsePromotionPopup(existingConfig.value.value) : defaultPromotionPopup()
    reset(toFormValues(initial))
    pending.reset()
    setOpenItemIds([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig, reset])

  const watchedSection = useWatch({ control, name: 'section' })
  const watchedItems = useWatch({ control, name: 'items' })

  // File đang chờ upload vẫn tính là có ảnh; phạm vi route bỏ qua vì lúc soạn chưa có trang hiện tại.
  const activeCount = useMemo(() => {
    const items: PromotionCampaign[] = (watchedItems ?? []).map((item, index) => ({
      ...(item as PromotionCampaign),
      image: item.image || (pending.files[fields[index]?.id] ? 'pending' : ''),
      startDate: pickerValueToYmd(item.startDate),
      endDate: pickerValueToYmd(item.endDate)
    }))
    return countLiveCampaigns({ section: { ...defaultPromotionPopup().section, ...watchedSection }, items }, today)
  }, [watchedItems, watchedSection, pending.files, fields, today])

  const setPendingFileForItem = (fieldId: string, file: File) => {
    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      toast.error(t('configsPage.promotionPopupDialog.errors.imageTooLarge', { max: MAX_UPLOAD_IMAGE_SIZE / 1048576 }))
      return
    }
    pending.stage(fieldId, file)
  }

  // `useFieldArray` chỉ gán id cho hàng sau khi append, nên phải hoãn việc mở hàng sang một effect.
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
    if (fieldId) pending.clear(fieldId)
    remove(index)
  }

  const onSubmit = handleSubmit(async (values) => {
    // File đang chờ upload không nằm trong form state, nên ràng buộc "phải có ảnh" kiểm tra ở đây.
    for (let i = 0; i < values.items.length; i++) {
      const fieldId = fields[i]?.id
      if (!values.items[i].image && !(fieldId && pending.files[fieldId])) {
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
        const file = fieldId ? pending.files[fieldId] : undefined

        let image = item.image
        if (file) {
          const url = await uploadFileWithToast({ file, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          // `encodeImageViewport` từ chối blob: URL, nên chỉ ghi viewport được sau khi ảnh có URL thật.
          image = encodeImageViewport(url, fieldId ? pending.viewports[fieldId] : null)
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

      queryClient.invalidateQueries({ queryKey: configKeys.all })
      // Reset baseline rồi đóng bằng `onSaved`. `onBack` là lối thoát có guard, gọi nó sẽ chạy đua
      // với lượt flush kế tiếp của dirty registry và hỏi bỏ đúng phần vừa lưu.
      reset(methods.getValues())
      onSaved?.()
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  })

  const submitting = isSaving || isUploading

  return (
    <InlineEditorShell
      editorId={PROMOTION_POPUP_KEY}
      title={t('configsPage.promotionPopupDialog.title')}
      description={t('configsPage.promotionPopupDialog.subtitle')}
      isDirty={methods.formState.isDirty}
      isSaving={submitting}
      onRevert={() => reset(methods.getValues(), { keepDefaultValues: true })}
      onSave={() => void onSubmit()}
      onBack={onBack}
    >
      <FormProvider {...methods}>
        <EditorCallout tone='warning'>{t('configsPage.promotionPopupDialog.publicWarning')}</EditorCallout>

        <EditorSection
          title={t('configsPage.promotionPopupDialog.section.title')}
          description={t('configsPage.promotionPopupDialog.section.subtitle')}
          action={
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
          }
        >
          <div className='space-y-5'>
            <Controller
              name='section.frequency'
              control={control}
              render={({ field }) => (
                <Field className='gap-1.5'>
                  <FieldLabel>{t('configsPage.promotionPopupDialog.section.frequencyField')}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-64'>
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
                  <FieldDescription className='text-xs'>
                    {t(`configsPage.promotionPopupDialog.section.frequencyHelp.${field.value}`)}
                  </FieldDescription>
                </Field>
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
        </EditorSection>

        <EditorSection
          title={t('configsPage.promotionPopupDialog.items.title')}
          description={t('configsPage.promotionPopupDialog.items.subtitle', {
            count: fields.length,
            active: activeCount
          })}
          action={
            <Button type='button' variant='outline' size='sm' onClick={addItem}>
              <Plus className='size-3.5' data-icon='inline-start' />
              {t('configsPage.promotionPopupDialog.items.add')}
            </Button>
          }
          contentClassName='space-y-3'
        >
          {activeCount > MAX_VISIBLE_CAMPAIGNS && (
            <EditorCallout tone='warning'>
              {t('configsPage.promotionPopupDialog.activeWarning', {
                max: MAX_VISIBLE_CAMPAIGNS,
                count: activeCount
              })}
            </EditorCallout>
          )}

          {fields.length === 0 ? (
            <div className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
              {t('configsPage.promotionPopupDialog.items.empty')}
            </div>
          ) : (
            <Accordion
              type='multiple'
              value={openItemIds}
              onValueChange={setOpenItemIds}
              className='space-y-2 rounded-2xl'
            >
              {fields.map((field, index) => (
                <CampaignRow
                  key={field.id}
                  fieldId={field.id}
                  index={index}
                  total={fields.length}
                  today={today}
                  sectionPages={watchedSection?.pages ?? []}
                  pendingPreviewUrl={pending.previews[field.id]}
                  pendingViewport={pending.viewports[field.id] ?? null}
                  onPendingViewportChange={(viewport) => pending.setViewport(field.id, viewport)}
                  onRemove={() => removeItem(index)}
                  onMove={(dir) => {
                    const to = index + dir
                    if (to >= 0 && to < fields.length) swap(index, to)
                  }}
                  onPickFile={(file) => setPendingFileForItem(field.id, file)}
                  onClearPendingFile={() => pending.clear(field.id)}
                />
              ))}
            </Accordion>
          )}
        </EditorSection>
      </FormProvider>
    </InlineEditorShell>
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
  // `alt.vi` kiêm luôn label của hàng.
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
            {/* 4:5 đúng khung storefront dành sẵn, nên đây là khung cắt thật. */}
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='aspect-[4/5] rounded-lg border bg-muted'
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

            <div className='flex items-center gap-1'>
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

          <div className='space-y-5'>
            <div className='space-y-1.5'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {/* Key trong namespace của tenant là chuỗi không có kiểu; field dùng chung nhận I18nKey gốc. */}
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

              <FieldDescription className='text-xs'>
                {t('configsPage.promotionPopupDialog.item.datesHelp')}
              </FieldDescription>
            </div>

            <Field data-invalid={Boolean(itemErrors?.href)} className='gap-1.5'>
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
                <Field data-invalid={lang === 'vi' && Boolean(itemErrors?.alt?.vi)} className='gap-1.5'>
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
