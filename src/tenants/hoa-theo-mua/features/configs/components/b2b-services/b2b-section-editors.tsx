/* eslint-disable react-refresh/only-export-components */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, ChevronsUpDown, ImageIcon, Plus, Trash2, UploadIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { toast } from 'sonner'
import {
  defaultFaqItem,
  defaultRichItem,
  defaultStatItem,
  type FaqItem,
  type RichItem,
  type StatItem
} from '../../b2b-service-detail-palette'
import type { LocalizedText } from '../../palette-shared'
import { emptyLocalizedText } from '../../palette-shared'
import { LocalizedTabs } from '../collection-shared'
import { ICON_REGISTRY } from './preview/preview-shared'

type Lang = 'vi' | 'en'

// When `locale` is passed, renders a single field for that locale only; when omitted,
// falls back to per-field vi/en tabs.
export function LocalizedField({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  rows = 2,
  description,
  locale
}: {
  label: string
  value: LocalizedText
  onChange: (next: LocalizedText) => void
  placeholder?: string
  textarea?: boolean
  rows?: number
  description?: string
  locale?: Lang
}) {
  const { t } = useTenantTranslation()

  const renderField = (lang: Lang) => (
    <Field className='gap-1'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>
      {textarea ? (
        <Textarea
          rows={rows}
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          placeholder={placeholder}
        />
      ) : (
        <Input
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          placeholder={placeholder}
        />
      )}
      {description && <FieldDescription className='text-xs'>{description}</FieldDescription>}
    </Field>
  )

  if (locale) return renderField(locale)

  return (
    <LocalizedTabs
      viLabel={t('configsPage.b2bServicesDialog.locale.vi')}
      enLabel={t('configsPage.b2bServicesDialog.locale.en')}
      renderField={renderField}
    />
  )
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
const isVideoUrl = (url: string): boolean => {
  const path = url.split('?')[0].toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

const MAX_B2B_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_B2B_VIDEO_SIZE = 30 * 1024 * 1024 // 30MB

export function ImageUploadField({
  value,
  onChange,
  label,
  description,
  allowVideo = false
}: {
  value: string
  onChange: (next: string) => void
  label: string
  description?: string
  /** When true, also accepts video uploads (e.g. the hero slot) and previews them inline. */
  allowVideo?: boolean
}) {
  const { t } = useTenantTranslation()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const isVideo = allowVideo && isVideoUrl(value)

  const pick = async (file: File) => {
    const isFileVideo = file.type.startsWith('video/')
    const maxSize = isFileVideo ? MAX_B2B_VIDEO_SIZE : MAX_B2B_IMAGE_SIZE
    if (file.size > maxSize) {
      toast.error(t('common.ui.fileTooLarge'), {
        description: t('common.ui.pleaseUploadSmallerFile')
      })
      return
    }
    const url = await uploadFileWithToast({ file, showSuccessToast: false })
    if (url) onChange(url)
  }

  return (
    <div className='space-y-2'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>
      <div className='aspect-[16/9] w-full max-w-xs overflow-hidden rounded-lg border bg-muted'>
        {value ? (
          isVideo ? (
            <video src={value} muted loop autoPlay playsInline className='size-full object-cover' />
          ) : (
            <img src={value} alt='' className='size-full object-cover' />
          )
        ) : (
          <div className='flex size-full items-center justify-center text-muted-foreground'>
            <ImageIcon className='size-6' />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type='file'
        accept={allowVideo ? 'image/*,video/*' : 'image/*'}
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) pick(file)
        }}
      />
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon data-icon='inline-start' />
          {value
            ? t('configsPage.b2bServicesDialog.fields.replaceImage')
            : t('configsPage.b2bServicesDialog.fields.uploadImage')}
        </Button>
        {value && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive'
            onClick={() => onChange('')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        )}
      </div>
      {description && <FieldDescription className='text-xs'>{description}</FieldDescription>}
    </div>
  )
}

export function ImageUploadList({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
  const { t } = useTenantTranslation()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const addMany = async (files: File[]) => {
    const urls = await Promise.all(files.map((file) => uploadFileWithToast({ file, showSuccessToast: false })))
    const uploaded = urls.filter((url): url is string => Boolean(url))
    if (uploaded.length) onChange([...items, ...uploaded])
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    onChange(next)
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <FieldLabel className='text-xs'>{t('configsPage.b2bServicesDialog.fields.gallery')}</FieldLabel>
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : []
            e.target.value = ''
            if (files.length) addMany(files)
          }}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          <Plus className='size-3.5' data-icon='inline-start' />
          {t('configsPage.b2bServicesDialog.fields.galleryAdd')}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.fields.galleryEmpty')}
        </p>
      ) : (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
          {items.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
            >
              <img src={url} alt='' className='size-full object-cover' />
              <div className='absolute inset-x-0 bottom-0 flex items-center justify-between gap-0.5 bg-black/40 p-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-6 text-white hover:bg-white/20'
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className='size-3' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-6 text-white hover:bg-white/20'
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className='size-3' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-6 text-white hover:bg-white/20 hover:text-destructive'
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 className='size-3' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function IconPickerField({
  value,
  onChange,
  label
}: {
  value: string
  onChange: (next: string) => void
  label: string
}) {
  const Icon = ICON_REGISTRY[value] ?? ICON_REGISTRY.sparkles
  return (
    <Field className='gap-1'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-full'>
          <Icon className='size-4' />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ICON_REGISTRY).map(([key, ItemIcon]) => (
            <SelectItem key={key} value={key}>
              <ItemIcon className='size-4' />
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function ListRow({
  index,
  total,
  label,
  onRemove,
  onMove,
  children
}: {
  index: number
  total: number
  label: string
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  children: ReactNode
}) {
  const { t } = useTenantTranslation()
  return (
    <AccordionItem value={`row-${index}`} className='border-b-transparent'>
      <div className='flex items-center gap-2 rounded-xl border bg-muted'>
        <AccordionTrigger
          className='min-w-0 p-2 hover:no-underline'
          headerClassName='min-w-0 flex-1'
          displayIcon={false}
        >
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-background text-xs font-medium text-muted-foreground'>
              {index + 1}
            </span>
            <span className='min-w-0 flex-1 truncate text-left text-sm font-medium'>{label}</span>
            <ChevronsUpDown className='size-3.5 shrink-0 text-muted-foreground' />
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
            aria-label={t('configsPage.b2bServicesDialog.item.moveUp')}
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
            aria-label={t('configsPage.b2bServicesDialog.item.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.b2bServicesDialog.item.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>
      <AccordionContent className='space-y-3 p-4'>{children}</AccordionContent>
    </AccordionItem>
  )
}

export function useListOps<T>(items: T[], onChange: (next: T[]) => void) {
  const update = (index: number, next: T) => onChange(items.map((it, i) => (i === index ? next : it)))
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const move = (from: number, direction: 1 | -1) => {
    const to = from + direction
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    onChange(next)
  }
  return { update, remove, move }
}

export function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type='button' variant='outline' size='sm' onClick={onClick}>
      <Plus className='size-3.5' data-icon='inline-start' />
      {label}
    </Button>
  )
}

export function localizedPreview(value: LocalizedText, fallback: string): string {
  return value.vi.trim() || value.en.trim() || fallback
}

export function RichItemListEditor({
  items,
  onChange,
  locale
}: {
  items: RichItem[]
  onChange: (next: RichItem[]) => void
  locale?: Lang
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultRichItem()])}
          label={t('configsPage.b2bServicesDialog.item.add')}
        />
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {items.map((item, index) => (
            <ListRow
              key={index}
              index={index}
              total={items.length}
              label={localizedPreview(
                item.title,
                t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 })
              )}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.title')}
                value={item.title}
                onChange={(title) => update(index, { ...item, title })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.description')}
                value={item.description}
                onChange={(description) => update(index, { ...item, description })}
                textarea
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function StatsListEditor({
  items,
  onChange,
  locale
}: {
  items: StatItem[]
  onChange: (next: StatItem[]) => void
  locale?: Lang
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultStatItem()])}
          label={t('configsPage.b2bServicesDialog.item.add')}
        />
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {items.map((item, index) => (
            <ListRow
              key={index}
              index={index}
              total={items.length}
              label={localizedPreview(
                item.value,
                t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 })
              )}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.statValue')}
                value={item.value}
                onChange={(value) => update(index, { ...item, value })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.statLabel')}
                value={item.label}
                onChange={(label) => update(index, { ...item, label })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.statCaption')}
                value={item.caption}
                onChange={(caption) => update(index, { ...item, caption })}
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function FaqListEditor({
  items,
  onChange,
  locale
}: {
  items: FaqItem[]
  onChange: (next: FaqItem[]) => void
  locale?: Lang
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton
          onClick={() => onChange([...items, defaultFaqItem()])}
          label={t('configsPage.b2bServicesDialog.item.add')}
        />
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {items.map((item, index) => (
            <ListRow
              key={index}
              index={index}
              total={items.length}
              label={localizedPreview(
                item.question,
                t('configsPage.b2bServicesDialog.item.untitled', { index: index + 1 })
              )}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.faqQuestion')}
                value={item.question}
                onChange={(question) => update(index, { ...item, question })}
                locale={locale}
              />
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.faqAnswer')}
                value={item.answer}
                onChange={(answer) => update(index, { ...item, answer })}
                textarea
                rows={3}
                description={t('configsPage.b2bServicesDialog.item.faqAnswerHelp')}
                locale={locale}
              />
              <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Switch checked={item.hasZalo} onCheckedChange={(hasZalo) => update(index, { ...item, hasZalo })} />
                {t('configsPage.b2bServicesDialog.item.faqHasZalo')}
              </Label>
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function LocalizedParagraphList({
  items,
  onChange,
  addLabel,
  locale
}: {
  items: LocalizedText[]
  onChange: (next: LocalizedText[]) => void
  addLabel: string
  locale?: Lang
}) {
  const { t } = useTenantTranslation()
  const { update, remove, move } = useListOps(items, onChange)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <AddRowButton onClick={() => onChange([...items, emptyLocalizedText()])} label={addLabel} />
      </div>
      {items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.item.empty')}
        </p>
      ) : (
        <Accordion type='multiple' className='space-y-2'>
          {items.map((item, index) => (
            <ListRow
              key={index}
              index={index}
              total={items.length}
              label={localizedPreview(item, t('configsPage.b2bServicesDialog.item.paragraph', { index: index + 1 }))}
              onRemove={() => remove(index)}
              onMove={(dir) => move(index, dir)}
            >
              <LocalizedField
                label={t('configsPage.b2bServicesDialog.item.paragraph', { index: index + 1 })}
                value={item}
                onChange={(next) => update(index, next)}
                textarea
                locale={locale}
              />
            </ListRow>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function OptionalSection({
  title,
  description,
  enabled,
  onToggle,
  children
}: {
  title: string
  description?: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  children: ReactNode
}) {
  const { t } = useTenantTranslation()
  return (
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-sm font-semibold'>{title}</div>
          {description && <div className='text-xs text-muted-foreground'>{description}</div>}
        </div>
        <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
          {t('configsPage.b2bServicesDialog.section.include')}
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </Label>
      </div>
      {enabled && <div className='mt-4 space-y-3'>{children}</div>}
    </div>
  )
}
