import { DatePickerField } from '@/components/date-picker-field'
import RatingField, { type RatingValue } from '@/components/rating-field'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ImageIcon,
  Plus,
  SaveIcon,
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
  FEEDBACK_SOURCES,
  FEEDBACKS_COLLECTION_KEY,
  FEEDBACKS_GROUP,
  MAX_FEATURED_FEEDBACKS,
  parseFeedbackCollection,
  type FeedbackCollection,
  type FeedbackItem,
  type FeedbackSource
} from '../feedbacks-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

type Lang = 'vi' | 'en'

type UIItem = FeedbackItem & { _uid: string }
type UICollection = Omit<FeedbackCollection, 'items'> & { items: UIItem[] }

const genUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

// DatePickerField round-trips ISO strings; the feedback collection stores YYYY-MM-DD
// (timezone-stable, JSON-friendly). Convert at the boundary.
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

export default function FeedbacksCollectionDialog({ open, onClose, existingConfig }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() => toUICollection(defaultFeedbackCollection()))
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const initial = existingConfig ? parseFeedbackCollection(existingConfig.value.value) : defaultFeedbackCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setPendingFiles({})
    Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    setPendingPreviews({})
    setOpenItemIds(ui.items.length === 1 ? [ui.items[0]._uid] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingConfig])

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setCollection((prev) => {
      const item = prev.items[index]
      if (item && pendingPreviews[item._uid]) {
        URL.revokeObjectURL(pendingPreviews[item._uid])
        setPendingPreviews((prev) => {
          const next = { ...prev }
          delete next[item._uid]
          return next
        })
        setPendingFiles((prev) => {
          const next = { ...prev }
          delete next[item._uid]
          return next
        })
      }
      return { ...prev, items: prev.items.filter((_, i) => i !== index) }
    })
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

  const setPendingFileForItem = (uid: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [uid]: file }))
    setPendingPreviews((prev) => {
      if (prev[uid]) URL.revokeObjectURL(prev[uid])
      return { ...prev, [uid]: URL.createObjectURL(file) }
    })
  }

  const validate = (): string | null => {
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
        const pending = pendingFiles[item._uid]
        if (!pending) continue
        const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
        if (!url) {
          setIsSaving(false)
          return
        }
        uiItems[i] = { ...item, image: url }
      }

      const resolved: FeedbackCollection = {
        ...collection,
        items: uiItems.map((item) => {
          const stripped: Partial<UIItem> = { ...item }
          delete stripped._uid
          return stripped as FeedbackItem
        })
      }

      const body: CreateConfigFormValues = {
        key: FEEDBACKS_COLLECTION_KEY,
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

      queryClient.invalidateQueries({ queryKey: ['configs'] })
      onClose()
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const submitting = isSaving || isUploading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent position='top-center' className='flex min-w-5xl flex-col gap-0 p-0' showCloseButton={false}>
        <DialogHeader className='px-6 pt-6 pb-3'>
          <DialogTitle>{t('configsPage.feedbacksDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.feedbacksDialog.subtitle')}</p>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 pb-4'>
          <SectionHeaderForm value={collection.section} onChange={updateSection} />

          <div className='mt-5 flex items-center justify-between'>
            <div>
              <div className='text-sm font-semibold'>{t('configsPage.feedbacksDialog.items.title')}</div>
              <div className='text-xs text-muted-foreground'>
                {t('configsPage.feedbacksDialog.items.subtitle', { count: collection.items.length })}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <FeaturedCounter count={featuredCount} max={MAX_FEATURED_FEEDBACKS} />
              <Button type='button' variant='outline' size='sm' onClick={addItem}>
                <Plus className='size-3.5' data-icon='inline-start' />
                {t('configsPage.feedbacksDialog.items.add')}
              </Button>
            </div>
          </div>

          {overLimit && (
            <div className='mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
              <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
              <span>{t('configsPage.feedbacksDialog.items.overLimit', { max: MAX_FEATURED_FEEDBACKS })}</span>
            </div>
          )}

          {collection.items.length === 0 ? (
            <div className='mt-4 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
              {t('configsPage.feedbacksDialog.items.empty')}
            </div>
          ) : (
            <Accordion
              type='multiple'
              value={openItemIds}
              onValueChange={setOpenItemIds}
              className='mt-3 space-y-2 rounded-2xl'
            >
              {collection.items.map((item, index) => (
                <ItemRow
                  key={item._uid}
                  uid={item._uid}
                  index={index}
                  total={collection.items.length}
                  item={item}
                  pendingPreviewUrl={pendingPreviews[item._uid]}
                  onChange={(patch) => updateItem(index, patch)}
                  onRemove={() => removeItem(index)}
                  onMove={(dir) => moveItem(index, index + dir)}
                  onPickFile={(file) => setPendingFileForItem(item._uid, file)}
                  onClearPendingFile={() => {
                    if (pendingPreviews[item._uid]) URL.revokeObjectURL(pendingPreviews[item._uid])
                    setPendingPreviews((prev) => {
                      const next = { ...prev }
                      delete next[item._uid]
                      return next
                    })
                    setPendingFiles((prev) => {
                      const next = { ...prev }
                      delete next[item._uid]
                      return next
                    })
                  }}
                />
              ))}
            </Accordion>
          )}
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button type='button' variant='outline' disabled={submitting} onClick={onClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='button' disabled={submitting || overLimit} onClick={handleSave}>
            {submitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {submitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeaturedCounter({ count, max }: { count: number; max: number }) {
  const { t } = useTenantTranslation()
  const over = count > max
  return (
    <span
      className={
        over
          ? 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800'
          : 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
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
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-sm font-semibold'>{t('configsPage.feedbacksDialog.section.title')}</div>
          <div className='text-xs text-muted-foreground'>{t('configsPage.feedbacksDialog.section.subtitle')}</div>
        </div>
        <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
          {t('configsPage.feedbacksDialog.section.enabled')}
          <Switch checked={value.enabled} onCheckedChange={(checked) => onChange({ enabled: checked })} />
        </Label>
      </div>

      <LocalizedTabs
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
    </div>
  )
}

function LocalizedTabs({ renderField }: { renderField: (lang: Lang) => React.ReactNode }) {
  const { t } = useTenantTranslation()
  return (
    <Tabs defaultValue='vi'>
      <TabsList className='h-8'>
        <TabsTrigger value='vi' className='text-xs'>
          {t('configsPage.feedbacksDialog.locale.vi')}
        </TabsTrigger>
        <TabsTrigger value='en' className='text-xs'>
          {t('configsPage.feedbacksDialog.locale.en')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='vi' className='mt-2'>
        {renderField('vi')}
      </TabsContent>
      <TabsContent value='en' className='mt-2'>
        {renderField('en')}
      </TabsContent>
    </Tabs>
  )
}

function ItemRow({
  uid,
  index,
  total,
  item,
  pendingPreviewUrl,
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
  onChange: (patch: Partial<FeedbackItem>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || item.image || ''
  const displayName = item.customerName || t('configsPage.feedbacksDialog.item.untitled', { index: index + 1 })

  const dateForm = useForm<{ postDate: string }>({
    defaultValues: { postDate: ymdToISO(item.postDate) }
  })

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex items-center gap-2 border rounded-xl bg-muted w-full'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <div className='size-10 shrink-0 overflow-hidden rounded-lg border bg-muted'>
              {displayPreview ? (
                <img src={displayPreview} alt='' className='size-full object-cover' />
              ) : (
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              )}
            </div>
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
            {item.isPlaceholder && (
              <Badge variant='outline' className='border-amber-300 bg-amber-50 text-[0.625rem] text-amber-700'>
                {t('configsPage.feedbacksDialog.item.demoBadge')}
              </Badge>
            )}
            {item.featured && (
              <Badge variant='outline' className='border-emerald-300 bg-emerald-50 text-[0.625rem] text-emerald-700'>
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
          {/* Image upload */}
          <div className='space-y-2'>
            <FieldLabel className='text-xs'>{t('configsPage.feedbacksDialog.item.image')}</FieldLabel>
            <div className='mt-1 aspect-square overflow-hidden rounded-lg border bg-muted'>
              {displayPreview ? (
                <img src={displayPreview} alt='' className='size-full object-cover' />
              ) : (
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-6' />
                </div>
              )}
            </div>

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

          {/* Right column — text + filters */}
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

            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Switch
                checked={item.isPlaceholder}
                onCheckedChange={(checked) => onChange({ isPlaceholder: checked })}
              />
              {t('configsPage.feedbacksDialog.item.placeholderToggle')}
            </Label>
            <FieldDescription className='text-xs'>
              {t('configsPage.feedbacksDialog.item.placeholderHelp')}
            </FieldDescription>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
