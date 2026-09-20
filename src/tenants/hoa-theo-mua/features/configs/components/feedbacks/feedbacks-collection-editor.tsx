import { DatePickerField } from '@/components/date-picker-field'
import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import RatingField, { type RatingValue } from '@/components/rating-field'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { decodeImageViewport, encodeImageViewport, type ImageViewport } from '@/lib/image-viewport'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ImageIcon,
  Plus,
  Sparkles,
  Star,
  Trash2,
  UploadIcon
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  countFeatured,
  defaultFeedbackCollection,
  defaultFeedbackItem,
  FEEDBACK_IMAGE_ASPECT,
  FEEDBACKS_GROUP,
  FEEDBACKS_KEY_PREFIX,
  feedbacksKeySuffix,
  MAX_FEATURED_FEEDBACKS,
  parseFeedbackCollection
} from '../../feedbacks-palette'
import { usePendingImages } from '../../hooks/use-pending-images'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import {
  ConfigKind,
  FEEDBACK_SOURCES,
  InputType,
  type Config,
  type FeedbackCollection,
  type FeedbackItem,
  type FeedbackSource
} from '../../types'
import { canCreateWithRegistry, isSuffixTaken, type SuffixRegistry } from '../../uniqueness'
import type { CreateConfigFormValues } from '../../validations'
import InlineEditorShell from '../settings/inline-editor-shell'
import { COLLECTION_KEY_SUFFIX_PATTERN, LocalizedTabs } from '../shared/collection-shared'
import EditorSection from '../shared/editor-section'

interface FeedbacksCollectionEditorProps {
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  /** Nhận key vừa lưu để caller chọn đúng bản ghi mới tạo thay vì rơi về bản đầu danh sách. */
  onSaved?: (savedKey: string) => void
  existingConfig: Config | null
  registry: SuffixRegistry
}

type UIItem = FeedbackItem & { _uid: string }
type UICollection = Omit<FeedbackCollection, 'items'> & { items: UIItem[] }

const genUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

// DatePickerField làm việc với chuỗi ISO, còn collection lưu YYYY-MM-DD (ổn định theo timezone,
// hợp với JSON). Quy đổi ngay tại ranh giới này.
const ymdToISO = (ymd: string): string => {
  if (!ymd) return ''
  const d = new Date(`${ymd}T00:00:00`)

  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

const isoToYMD = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const toUICollection = (c: FeedbackCollection): UICollection => ({
  ...c,
  items: c.items.map((item) => ({ ...item, _uid: genUid() }))
})

export default function FeedbacksCollectionEditor({
  existingConfig,
  registry,
  onBack,
  onSaved
}: FeedbacksCollectionEditorProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() => toUICollection(defaultFeedbackCollection()))
  const pending = usePendingImages()
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [keySuffix, setKeySuffix] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [baseline, setBaseline] = useState('')

  useEffect(() => {
    const initial = existingConfig ? parseFeedbackCollection(existingConfig.value.value) : defaultFeedbackCollection()
    const ui = toUICollection(initial)
    const suffix = existingConfig ? feedbacksKeySuffix(existingConfig.key) : ''
    setCollection(ui)
    pending.reset()
    setOpenItemIds(ui.items.length === 1 ? [ui.items[0]._uid] : [])
    // Baseline phải cùng dạng với `snapshot()`, không để chuỗi rỗng, nếu không `isDirty` bật ngay
    // lúc record vừa load, trước khi người dùng chạm vào gì.
    setBaseline(JSON.stringify({ collection: ui, keySuffix: suffix }))
    setKeySuffix(suffix)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig])

  const featuredCount = useMemo(() => countFeatured(collection.items), [collection.items])
  const overLimit = featuredCount > MAX_FEATURED_FEEDBACKS

  const updateSection = (patch: Partial<FeedbackCollection['section']>) =>
    setCollection((prev) => ({ ...prev, section: { ...prev.section, ...patch } }))

  const updateItem = useCallback((index: number, patch: Partial<FeedbackItem>) => {
    setCollection((prev) => {
      const next = [...prev.items]
      next[index] = { ...next[index], ...patch }
      return { ...prev, items: next }
    })
  }, [])

  const addItem = () => {
    const item: UIItem = { ...defaultFeedbackItem(), _uid: genUid() }
    setCollection((prev) => ({ ...prev, items: [...prev.items, item] }))
    setOpenItemIds((prev) => [...prev, item._uid])
  }

  const removeItem = (index: number) => {
    const item = collection.items[index]
    if (item) pending.clear(item._uid)
    setCollection((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= collection.items.length) return
    setCollection((prev) => {
      const next = [...prev.items]
      const [picked] = next.splice(from, 1)
      next.splice(to, 0, picked)
      return { ...prev, items: next }
    })
  }

  const validate = (): string | null => {
    if (!existingConfig) {
      const trimmed = keySuffix.trim()
      if (!trimmed) return t('configsPage.collectionKey.errors.required')
      if (!COLLECTION_KEY_SUFFIX_PATTERN.test(trimmed)) return t('configsPage.collectionKey.errors.invalid')
      // Tạo mới cần danh sách đã tải đủ; danh sách đang tải hoặc lỗi thì chặn, không đoán bừa.
      if (!canCreateWithRegistry(registry)) return t('configsPage.collectionKey.errors.unverified')
      if (isSuffixTaken(registry, trimmed)) return t('configsPage.collectionKey.errors.duplicate')
    }
    if (!collection.section.title.vi.trim()) return t('configsPage.feedbacksDialog.errors.sectionTitleRequired')
    if (overLimit) return t('configsPage.feedbacksDialog.errors.tooManyFeatured', { max: MAX_FEATURED_FEEDBACKS })

    for (let i = 0; i < collection.items.length; i++) {
      const item = collection.items[i]
      if (!item.customerName.trim()) return t('configsPage.feedbacksDialog.errors.nameRequired', { index: i + 1 })
      if (!item.content.vi.trim()) return t('configsPage.feedbacksDialog.errors.contentRequired', { index: i + 1 })
      if (!item.postDate.trim()) return t('configsPage.feedbacksDialog.errors.postDateRequired', { index: i + 1 })
    }
    return null
  }

  // So với snapshot lần lưu gần nhất để shell đăng ký dirty với registry của cả trang. File đang
  // chờ upload không tính vào đây: đó là state tạm, không phải nội dung.
  const snapshot = () => JSON.stringify({ collection, keySuffix })

  const revert = () => {
    const initial = existingConfig ? parseFeedbackCollection(existingConfig.value.value) : defaultFeedbackCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setKeySuffix(existingConfig ? feedbacksKeySuffix(existingConfig.key) : '')
    setBaseline(
      JSON.stringify({ collection: ui, keySuffix: existingConfig ? feedbacksKeySuffix(existingConfig.key) : '' })
    )
  }

  const handleSave = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setIsSaving(true)
    try {
      const uiItems = [...collection.items]
      for (let i = 0; i < uiItems.length; i++) {
        const item = uiItems[i]
        const file = pending.files[item._uid]
        if (!file) continue
        const url = await uploadFileWithToast({ file, showSuccessToast: false })
        if (!url) {
          setIsSaving(false)
          return
        }
        uiItems[i] = { ...item, image: encodeImageViewport(url, pending.viewports[item._uid] ?? null) }
      }

      const resolved: FeedbackCollection = {
        ...collection,
        items: uiItems.map((item) => {
          const stripped: Partial<UIItem> = { ...item }
          delete stripped._uid
          return stripped as FeedbackItem
        })
      }

      const composedKey = existingConfig ? existingConfig.key : `${FEEDBACKS_KEY_PREFIX}${keySuffix.trim()}`
      const body: CreateConfigFormValues = {
        key: composedKey,
        isPublic: true,
        group: FEEDBACKS_GROUP,
        kind: ConfigKind.content,
        value: {
          group: FEEDBACKS_GROUP,
          label: t('configsPage.feedbacksDialog.configLabel'),
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
      // Đóng bằng `onSaved`, không dùng `onBack` - xem `inline-editor-shell`.
      setBaseline(snapshot())
      onSaved?.(composedKey)
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const submitting = isSaving || isUploading

  return (
    <InlineEditorShell
      editorId={existingConfig?.key ?? 'new:feedbacks'}
      title={t('configsPage.feedbacksDialog.title')}
      description={t('configsPage.feedbacksDialog.subtitle')}
      isDirty={snapshot() !== baseline}
      isSaving={submitting}
      onRevert={revert}
      onSave={handleSave}
      onBack={onBack}
    >
      <SectionHeaderForm value={collection.section} onChange={updateSection} />

      <EditorSection
        title={t('configsPage.feedbacksDialog.items.title')}
        description={t('configsPage.feedbacksDialog.items.subtitle', { count: collection.items.length })}
        action={
          <div className='flex items-center gap-3'>
            <FeaturedCounter count={featuredCount} max={MAX_FEATURED_FEEDBACKS} />
            <Button type='button' variant='outline' size='sm' onClick={addItem}>
              <Plus className='size-3.5' data-icon='inline-start' />
              {t('configsPage.feedbacksDialog.items.add')}
            </Button>
          </div>
        }
        contentClassName='space-y-3'
      >
        {overLimit && (
          <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 px-3 py-2 text-xs text-amber-800 dark:text-amber-200'>
            <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
            <span>{t('configsPage.feedbacksDialog.items.overLimit', { max: MAX_FEATURED_FEEDBACKS })}</span>
          </div>
        )}

        {collection.items.length === 0 ? (
          <div className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
            {t('configsPage.feedbacksDialog.items.empty')}
          </div>
        ) : (
          <Accordion
            type='multiple'
            value={openItemIds}
            onValueChange={setOpenItemIds}
            className='space-y-2 rounded-2xl'
          >
            {collection.items.map((item, index) => (
              <ItemRow
                key={item._uid}
                uid={item._uid}
                index={index}
                total={collection.items.length}
                item={item}
                pendingPreviewUrl={pending.previews[item._uid]}
                pendingViewport={pending.viewports[item._uid] ?? null}
                onPendingViewportChange={(viewport) => pending.setViewport(item._uid, viewport)}
                onChange={(patch) => updateItem(index, patch)}
                onRemove={() => removeItem(index)}
                onMove={(dir) => moveItem(index, index + dir)}
                onPickFile={(file) => pending.stage(item._uid, file)}
                onClearPendingFile={() => pending.clear(item._uid)}
              />
            ))}
          </Accordion>
        )}
      </EditorSection>
    </InlineEditorShell>
  )
}

function FeaturedCounter({ count, max }: { count: number; max: number }) {
  const { t } = useTenantTranslation()
  const over = count > max
  return (
    <span
      className={
        over
          ? 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200'
          : 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300'
      }
    >
      <Sparkles className='size-3' />
      {t('configsPage.feedbacksDialog.items.featuredCount', { count, max })}
    </span>
  )
}

function SectionHeaderForm({
  value,
  onChange
}: {
  value: FeedbackCollection['section']
  onChange: (patch: Partial<FeedbackCollection['section']>) => void
}) {
  const { t } = useTenantTranslation()

  return (
    <EditorSection
      title={t('configsPage.feedbacksDialog.section.title')}
      description={t('configsPage.feedbacksDialog.section.subtitle')}
      action={
        <Select
          value={value.enabled ? 'visible' : 'hidden'}
          onValueChange={(v) => onChange({ enabled: v === 'visible' })}
        >
          <SelectTrigger size='sm' aria-label={t('configsPage.feedbacksDialog.section.statusField')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align='end'>
            <SelectItem value='visible'>{t('configsPage.feedbacksDialog.section.status.visible')}</SelectItem>
            <SelectItem value='hidden'>{t('configsPage.feedbacksDialog.section.status.hidden')}</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <LocalizedTabs
        viLabel={t('configsPage.feedbacksDialog.locale.vi')}
        enLabel={t('configsPage.feedbacksDialog.locale.en')}
        renderField={(lang) => (
          <div className='space-y-2'>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.feedbacksDialog.section.titleField')}</FieldLabel>
              <Input
                value={value.title[lang]}
                onChange={(e) => onChange({ title: { ...value.title, [lang]: e.target.value } })}
                placeholder={t('configsPage.feedbacksDialog.section.titlePlaceholder')}
              />
            </Field>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.feedbacksDialog.section.descriptionField')}</FieldLabel>
              <Textarea
                rows={2}
                value={value.description[lang]}
                onChange={(e) => onChange({ description: { ...value.description, [lang]: e.target.value } })}
                placeholder={t('configsPage.feedbacksDialog.section.descriptionPlaceholder')}
              />
            </Field>
          </div>
        )}
      />
    </EditorSection>
  )
}

function ItemRow({
  uid,
  index,
  total,
  item,
  pendingPreviewUrl,
  pendingViewport,
  onPendingViewportChange,
  onChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile
}: {
  uid: string
  index: number
  total: number
  item: FeedbackItem
  pendingPreviewUrl?: string
  pendingViewport: ImageViewport | null
  onPendingViewportChange: (viewport: ImageViewport | null) => void
  onChange: (patch: Partial<FeedbackItem>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || item.image || ''

  const isStaged = Boolean(pendingPreviewUrl)
  const viewport = isStaged ? pendingViewport : decodeImageViewport(item.image).viewport

  const handleViewportChange = (next: ImageViewport | null) => {
    if (isStaged) onPendingViewportChange(next)
    else onChange({ image: encodeImageViewport(item.image, next) })
  }
  const displayName = item.customerName || t('configsPage.feedbacksDialog.item.untitled', { index: index + 1 })

  const dateForm = useForm<{ postDate: string }>({
    defaultValues: { postDate: ymdToISO(item.postDate) }
  })

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex w-full items-center gap-2 rounded-xl border bg-muted'>
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
              <span className='flex items-center gap-1.5 truncate text-xs text-muted-foreground'>
                {item.rating !== undefined && (
                  <span className='flex items-center gap-0.5 text-amber-500'>
                    <Star className='size-3 fill-current' />
                    {item.rating}
                  </span>
                )}
                <span className='truncate'>
                  {[item.area, item.flowerType].filter(Boolean).join(' · ') ||
                    t('configsPage.feedbacksDialog.item.noMeta')}
                </span>
              </span>
            </div>
            {item.featured && (
              <Badge
                variant='outline'
                className='border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50 text-[0.625rem] text-emerald-700 dark:text-emerald-300'
              >
                <Sparkles className='mr-0.5 size-2.5' />
                {t('configsPage.feedbacksDialog.item.featuredBadge')}
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
            aria-label={t('configsPage.feedbacksDialog.item.moveUp')}
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
            aria-label={t('configsPage.feedbacksDialog.item.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>

          <Label className='ml-1 flex items-center gap-1 text-[0.625rem] text-muted-foreground'>
            {t('configsPage.feedbacksDialog.item.featuredToggle')}
            <Switch checked={item.featured} onCheckedChange={(checked) => onChange({ featured: checked })} />
          </Label>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.feedbacksDialog.item.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='p-4 rounded-b-2xl'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]'>
          {/* Xem trước và cắt đều theo hình vuông vì storefront render ảnh này thành avatar tròn
              40px - đóng khung theo tỉ lệ khác ở đây là hiển thị sai so với bản chạy thật. Chọn
              file mới chỉ là đưa vào hàng chờ; upload diễn ra lúc lưu nên thoát ra không để lại
              file mồ côi. */}
          <div className='space-y-2'>
            <FieldLabel className='text-xs'>{t('configsPage.feedbacksDialog.item.image')}</FieldLabel>
            <ImageWithViewport
              src={displayPreview}
              viewport={viewport}
              className='mt-1 aspect-square rounded-lg border bg-muted'
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
                className='flex-1 w-full'
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon data-icon='inline-start' />
                {displayPreview
                  ? t('configsPage.feedbacksDialog.item.replaceImage')
                  : t('configsPage.feedbacksDialog.item.uploadImage')}
              </Button>

              <ImageViewportButton
                src={displayPreview}
                viewport={viewport}
                onViewportChange={handleViewportChange}
                aspectRatio={FEEDBACK_IMAGE_ASPECT}
                size='icon-sm'
              />

              {(pendingPreviewUrl || item.image) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    onChange({ image: '' })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>

            <FieldDescription className='text-xs'>{t('configsPage.feedbacksDialog.item.imageHelp')}</FieldDescription>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.nameField')}</FieldLabel>
                <Input
                  value={item.customerName}
                  onChange={(e) => onChange({ customerName: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.namePlaceholder')}
                />
                <FieldDescription className='text-xs'>
                  {t('configsPage.feedbacksDialog.item.nameHelp')}
                </FieldDescription>
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.areaField')}</FieldLabel>
                <Input
                  value={item.area}
                  onChange={(e) => onChange({ area: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.areaPlaceholder')}
                />
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.flowerTypeField')}</FieldLabel>
                <Input
                  value={item.flowerType}
                  onChange={(e) => onChange({ flowerType: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.flowerTypePlaceholder')}
                />
              </Field>

              <DatePickerField
                control={dateForm.control}
                name='postDate'
                label={'configsPage.feedbacksDialog.item.postDateField' as I18nKey}
                placeholder={'configsPage.feedbacksDialog.item.postDatePlaceholder' as I18nKey}
                isRequired
                displayError={false}
                onValueChange={(iso) => onChange({ postDate: isoToYMD(iso) })}
                maxDate={new Date()}
              />

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.sourceField')}</FieldLabel>
                <Select value={item.source} onValueChange={(value) => onChange({ source: value as FeedbackSource })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_SOURCES.map((src) => (
                      <SelectItem key={src} value={src}>
                        {t(`configsPage.feedbacksDialog.item.source.${src}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.sourceUrlField')}</FieldLabel>
                <Input
                  value={item.sourceUrl}
                  onChange={(e) => onChange({ sourceUrl: e.target.value })}
                  placeholder='https://...'
                />
              </Field>
            </div>

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.feedbacksDialog.item.ratingField')}</FieldLabel>
              <div className='flex items-center gap-3'>
                <RatingField
                  value={item.rating}
                  setValue={(value: RatingValue | undefined) => onChange({ rating: value })}
                  size={22}
                />
                <span className='text-xs text-muted-foreground'>
                  {item.rating !== undefined
                    ? t('configsPage.feedbacksDialog.item.ratingValue', { value: item.rating })
                    : t('configsPage.feedbacksDialog.item.ratingEmpty')}
                </span>
              </div>
              <FieldDescription className='text-xs'>
                {t('configsPage.feedbacksDialog.item.ratingHelp')}
              </FieldDescription>
            </Field>

            <LocalizedTabs
              viLabel={t('configsPage.feedbacksDialog.locale.vi')}
              enLabel={t('configsPage.feedbacksDialog.locale.en')}
              renderField={(lang) => (
                <Field className='gap-1'>
                  <FieldLabel>{t('configsPage.feedbacksDialog.item.contentField')}</FieldLabel>
                  <Textarea
                    rows={4}
                    value={item.content[lang]}
                    onChange={(e) => onChange({ content: { ...item.content, [lang]: e.target.value } })}
                    placeholder={t('configsPage.feedbacksDialog.item.contentPlaceholder')}
                  />
                  <FieldDescription className='text-xs'>
                    {t('configsPage.feedbacksDialog.item.contentHelp')}
                  </FieldDescription>
                </Field>
              )}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
