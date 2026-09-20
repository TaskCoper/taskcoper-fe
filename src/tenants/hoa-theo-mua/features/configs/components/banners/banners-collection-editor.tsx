import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { decodeImageViewport, encodeImageViewport, type ImageViewport } from '@/lib/image-viewport'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, ExternalLink, ImageIcon, LinkIcon, Plus, Trash2, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  bannerKeySuffix,
  BANNERS_GROUP,
  BANNERS_KEY_PREFIX,
  bannerShapeForSlot,
  collectSlotKeys,
  defaultBannerCollection,
  defaultBannerItem,
  KNOWN_BANNER_SLOTS,
  parseBannerCollection,
  type BannerShape
} from '../../banners-palette'
import { usePendingImages } from '../../hooks/use-pending-images'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import { ConfigKind, InputType, type BannerCollection, type BannerItem, type Config } from '../../types'
import { canCreateWithRegistry, isSuffixTaken, type SuffixRegistry } from '../../uniqueness'
import type { CreateConfigFormValues } from '../../validations'
import InlineEditorShell from '../settings/inline-editor-shell'
import { COLLECTION_KEY_SUFFIX_PATTERN } from '../shared/collection-shared'
import EditorSection from '../shared/editor-section'

interface Props {
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  /** Nhận key vừa lưu để caller chọn đúng bản ghi mới tạo thay vì rơi về bản đầu danh sách. */
  onSaved?: (savedKey: string) => void
  existingConfig: Config | null
  registry: SuffixRegistry
}

type UIItem = BannerItem & { _uid: string }
type UICollection = Omit<BannerCollection, 'items'> & { items: UIItem[] }

type Lang = 'vi' | 'en'
const LANGS: Lang[] = ['vi', 'en']

const genUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

// Mỗi ngôn ngữ có ảnh riêng, nên ảnh chờ upload phải khoá theo cả item lẫn locale.
const pendingKey = (uid: string, lang: Lang): string => `${uid}:${lang}`

const toUICollection = (c: BannerCollection): UICollection => ({
  ...c,
  items: c.items.map((item) => ({ ...item, _uid: genUid() }))
})

export default function BannersCollectionEditor({ existingConfig, registry, onBack, onSaved }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() => toUICollection(defaultBannerCollection()))
  const pending = usePendingImages()
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [keySuffix, setKeySuffix] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [baseline, setBaseline] = useState('')

  useEffect(() => {
    const initial = existingConfig ? parseBannerCollection(existingConfig.value.value) : defaultBannerCollection()
    const ui = toUICollection(initial)
    const suffix = existingConfig ? bannerKeySuffix(existingConfig.key) : ''
    setCollection(ui)
    pending.reset()
    setOpenItemIds(ui.items.length === 1 ? [ui.items[0]._uid] : [])
    // Baseline phải cùng dạng với `snapshot()`, không để chuỗi rỗng, nếu không `isDirty` bật ngay
    // lúc record vừa load, trước khi người dùng chạm vào gì.
    setBaseline(JSON.stringify({ collection: ui, keySuffix: suffix }))
    setKeySuffix(suffix)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig])

  const knownSlots = Array.from(new Set([...KNOWN_BANNER_SLOTS, ...collectSlotKeys(collection.items)]))

  const updateItem = useCallback((index: number, patch: Partial<BannerItem>) => {
    setCollection((prev) => {
      const next = [...prev.items]
      next[index] = { ...next[index], ...patch }
      return { ...prev, items: next }
    })
  }, [])

  const addItem = () => {
    const item: UIItem = { ...defaultBannerItem(), _uid: genUid() }
    setCollection((prev) => ({ ...prev, items: [...prev.items, item] }))
    setOpenItemIds((prev) => [...prev, item._uid])
  }

  const removeItem = (index: number) => {
    const item = collection.items[index]
    if (item) pending.clear(LANGS.map((lang) => pendingKey(item._uid, lang)))
    setCollection((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
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
    for (let i = 0; i < collection.items.length; i++) {
      const item = collection.items[i]
      if (!item.slot.trim()) return t('configsPage.bannersDialog.errors.slotRequired', { index: i + 1 })
      // Tiếng Việt là locale mặc định nên ảnh vi là bắt buộc; en thiếu thì fallback về vi.
      if (!item.image.vi.trim() && !pending.files[pendingKey(item._uid, 'vi')])
        return t('configsPage.bannersDialog.errors.imageRequired', { index: i + 1 })
      if (!item.href.trim()) return t('configsPage.bannersDialog.errors.hrefRequired', { index: i + 1 })
    }
    return null
  }

  // So với snapshot lần lưu gần nhất để shell đăng ký dirty với registry của cả trang. File đang
  // chờ upload không tính vào đây: đó là state tạm, không phải nội dung.
  const snapshot = () => JSON.stringify({ collection, keySuffix })

  const revert = () => {
    const initial = existingConfig ? parseBannerCollection(existingConfig.value.value) : defaultBannerCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setKeySuffix(existingConfig ? bannerKeySuffix(existingConfig.key) : '')
    setBaseline(
      JSON.stringify({ collection: ui, keySuffix: existingConfig ? bannerKeySuffix(existingConfig.key) : '' })
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
        let image = item.image
        for (const lang of LANGS) {
          const key = pendingKey(item._uid, lang)
          const file = pending.files[key]
          if (!file) continue
          const url = await uploadFileWithToast({ file, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          image = { ...image, [lang]: encodeImageViewport(url, pending.viewports[key] ?? null) }
        }
        uiItems[i] = { ...item, image }
      }

      const resolved: BannerCollection = {
        ...collection,
        items: uiItems.map((item) => {
          const stripped: Partial<UIItem> = { ...item }
          delete stripped._uid
          return stripped as BannerItem
        })
      }

      const composedKey = existingConfig ? existingConfig.key : `${BANNERS_KEY_PREFIX}${keySuffix.trim()}`
      const body: CreateConfigFormValues = {
        key: composedKey,
        isPublic: true,
        group: BANNERS_GROUP,
        kind: ConfigKind.content,
        value: {
          group: BANNERS_GROUP,
          label: t('configsPage.bannersDialog.configLabel'),
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
      editorId={existingConfig?.key ?? 'new:banners'}
      title={t('configsPage.bannersDialog.title')}
      description={t('configsPage.bannersDialog.subtitle')}
      isDirty={snapshot() !== baseline}
      isSaving={submitting}
      onRevert={revert}
      onSave={() => void handleSave()}
      onBack={onBack}
    >
      <EditorSection
        title={t('configsPage.bannersDialog.section.title')}
        description={t('configsPage.bannersDialog.section.subtitle')}
        action={
          <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
            {t('configsPage.bannersDialog.section.enabled')}

            <Switch
              checked={collection.section.enabled}
              onCheckedChange={(checked) =>
                setCollection((prev) => ({ ...prev, section: { ...prev.section, enabled: checked } }))
              }
            />
          </Label>
        }
      />

      <EditorSection
        title={t('configsPage.bannersDialog.items.title')}
        description={t('configsPage.bannersDialog.items.subtitle', { count: collection.items.length })}
        action={
          <Button type='button' variant='outline' size='sm' onClick={addItem}>
            <Plus className='size-3.5' data-icon='inline-start' />
            {t('configsPage.bannersDialog.items.add')}
          </Button>
        }
      >
        {collection.items.length === 0 ? (
          <div className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
            {t('configsPage.bannersDialog.items.empty')}
          </div>
        ) : (
          <Accordion
            type='multiple'
            value={openItemIds}
            onValueChange={setOpenItemIds}
            className='space-y-2 rounded-2xl'
          >
            {collection.items.map((item, index) => (
              <BannerRow
                key={item._uid}
                uid={item._uid}
                index={index}
                item={item}
                knownSlots={knownSlots}
                pendingPreviewUrl={(lang) => pending.previews[pendingKey(item._uid, lang)]}
                pendingViewport={(lang) => pending.viewports[pendingKey(item._uid, lang)] ?? null}
                onPendingViewportChange={(lang, viewport) => pending.setViewport(pendingKey(item._uid, lang), viewport)}
                onChange={(patch) => updateItem(index, patch)}
                onRemove={() => removeItem(index)}
                onPickFile={(lang, file) => pending.stage(pendingKey(item._uid, lang), file)}
                onClearPendingFile={(lang) => pending.clear(pendingKey(item._uid, lang))}
              />
            ))}
          </Accordion>
        )}
      </EditorSection>
    </InlineEditorShell>
  )
}

function BannerRow({
  uid,
  index,
  item,
  knownSlots,
  pendingPreviewUrl,
  pendingViewport,
  onPendingViewportChange,
  onChange,
  onRemove,
  onPickFile,
  onClearPendingFile
}: {
  uid: string
  index: number
  item: BannerItem
  knownSlots: string[]
  pendingPreviewUrl: (lang: Lang) => string | undefined
  pendingViewport: (lang: Lang) => ImageViewport | null
  onPendingViewportChange: (lang: Lang, viewport: ImageViewport | null) => void
  onChange: (patch: Partial<BannerItem>) => void
  onRemove: () => void
  onPickFile: (lang: Lang, file: File) => void
  onClearPendingFile: (lang: Lang) => void
}) {
  const { t } = useTenantTranslation()
  const datalistId = `banner-slot-suggestions-${uid}`
  const displayLabel = item.slot || t('configsPage.bannersDialog.item.untitled', { index: index + 1 })
  const shape = bannerShapeForSlot(item.slot)
  // Một công tắc ngôn ngữ dùng chung cho cả ảnh lẫn alt text, thay vì mỗi field một tab VI/EN riêng.
  const [lang, setLang] = useState<Lang>('vi')

  // Thumbnail ở header lấy ảnh vi (ảnh bắt buộc), lùi về en khi item chưa chọn ảnh vi.
  const headerLang: Lang = item.image.vi || pendingPreviewUrl('vi') ? 'vi' : 'en'
  const headerPreview = pendingPreviewUrl(headerLang) || item.image[headerLang] || ''
  const headerViewport = pendingPreviewUrl(headerLang)
    ? pendingViewport(headerLang)
    : decodeImageViewport(item.image[headerLang]).viewport

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex w-full items-center gap-2 rounded-xl border bg-muted'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <ImageWithViewport
              src={headerPreview}
              viewport={headerViewport}
              className='h-10 w-16 shrink-0 rounded-lg border bg-muted'
              fallback={
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              }
            />
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='truncate text-sm font-medium'>{displayLabel}</span>
              <span className='flex items-center gap-1 truncate text-xs text-muted-foreground'>
                {item.href ? (
                  <>
                    {item.openInNewTab ? <ExternalLink className='size-3' /> : <LinkIcon className='size-3' />}
                    <span className='truncate'>{item.href}</span>
                  </>
                ) : (
                  t('configsPage.bannersDialog.item.noHref')
                )}
              </span>
            </div>
            {!item.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.bannersDialog.item.disabled')}
              </Badge>
            )}
            <ChevronsUpDown className='size-3.5 text-muted-foreground' />
          </div>
        </AccordionTrigger>

        <div className='flex items-center gap-0.5 mr-2'>
          <Switch checked={item.enabled} onCheckedChange={(checked) => onChange({ enabled: checked })} />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.bannersDialog.item.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='py-2 px-0.5'>
        <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)} className='mb-3'>
          <TabsList className='h-8'>
            <TabsTrigger value='vi' className='text-xs'>
              {t('configsPage.bannersDialog.locale.vi')}
            </TabsTrigger>
            <TabsTrigger value='en' className='text-xs'>
              {t('configsPage.bannersDialog.locale.en')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]'>
          <BannerImageField
            image={item.image[lang]}
            pendingPreviewUrl={pendingPreviewUrl(lang)}
            pendingViewport={pendingViewport(lang)}
            shape={shape}
            onChangeImage={(next) => onChange({ image: { ...item.image, [lang]: next } })}
            onViewportChange={(next) => {
              if (pendingPreviewUrl(lang)) onPendingViewportChange(lang, next)
              else onChange({ image: { ...item.image, [lang]: encodeImageViewport(item.image[lang], next) } })
            }}
            onPickFile={(file) => onPickFile(lang, file)}
            onClearPendingFile={() => onClearPendingFile(lang)}
          />

          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.bannersDialog.item.slotField')}</FieldLabel>
                <Input
                  list={datalistId}
                  value={item.slot}
                  onChange={(e) => onChange({ slot: e.target.value.trim() })}
                  placeholder={t('configsPage.bannersDialog.item.slotPlaceholder')}
                  className='font-mono text-sm'
                />
                <datalist id={datalistId}>
                  {knownSlots.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <FieldDescription className='text-xs'>{t('configsPage.bannersDialog.item.slotHelp')}</FieldDescription>
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.bannersDialog.item.hrefField')}</FieldLabel>
                <Input
                  value={item.href}
                  onChange={(e) => onChange({ href: e.target.value })}
                  placeholder='/products/... hoặc https://...'
                />
                <FieldDescription className='text-xs'>{t('configsPage.bannersDialog.item.hrefHelp')}</FieldDescription>
              </Field>
            </div>

            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Switch checked={item.openInNewTab} onCheckedChange={(checked) => onChange({ openInNewTab: checked })} />
              {t('configsPage.bannersDialog.item.openInNewTabToggle')}
            </Label>

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.bannersDialog.item.altField')}</FieldLabel>
              <Input
                value={item.alt[lang]}
                onChange={(e) => onChange({ alt: { ...item.alt, [lang]: e.target.value } })}
                placeholder={t('configsPage.bannersDialog.item.altPlaceholder')}
              />
              <FieldDescription className='text-xs'>{t('configsPage.bannersDialog.item.altHelp')}</FieldDescription>
            </Field>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function BannerImageField({
  image,
  pendingPreviewUrl,
  pendingViewport,
  shape,
  onChangeImage,
  onViewportChange,
  onPickFile,
  onClearPendingFile
}: {
  image: string
  pendingPreviewUrl?: string
  pendingViewport: ImageViewport | null
  shape: BannerShape
  onChangeImage: (next: string) => void
  onViewportChange: (next: ImageViewport | null) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || image || ''
  const isStaged = Boolean(pendingPreviewUrl)
  const viewport = isStaged ? pendingViewport : decodeImageViewport(image).viewport

  return (
    <div className='space-y-2'>
      <FieldLabel className='text-xs'>{t('configsPage.bannersDialog.item.image')}</FieldLabel>
      <ImageWithViewport
        src={displayPreview}
        viewport={viewport}
        className='mt-1 rounded-lg border bg-muted'
        style={{ aspectRatio: shape.aspect }}
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
            ? t('configsPage.bannersDialog.item.replaceImage')
            : t('configsPage.bannersDialog.item.uploadImage')}
        </Button>

        <ImageViewportButton
          src={displayPreview}
          viewport={viewport}
          onViewportChange={onViewportChange}
          aspectRatio={shape.aspect}
          size='icon-sm'
        />

        {(pendingPreviewUrl || image) && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive'
            onClick={() => {
              onClearPendingFile()
              onChangeImage('')
            }}
          >
            <Trash2 className='size-3.5' />
          </Button>
        )}
      </div>

      <FieldDescription className='text-xs'>
        {t('configsPage.bannersDialog.item.imageHelp', { ratio: shape.label, example: shape.example })}
      </FieldDescription>
    </div>
  )
}
