import { ImageViewportButton } from '@/components/image-viewport-editor'
import { ImageWithViewport } from '@/components/image-with-viewport'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { decodeImageViewport, encodeImageViewport, type ImageViewport } from '@/lib/image-viewport'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, ExternalLink, ImageIcon, LinkIcon, Plus, SaveIcon, Trash2, UploadIcon } from 'lucide-react'
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
  type BannerCollection,
  type BannerItem,
  type BannerShape
} from '../banners-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import { COLLECTION_KEY_SUFFIX_PATTERN, CollectionKeyField } from './collection-shared'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
  takenSuffixes?: Set<string>
}

type UIItem = BannerItem & { _uid: string }
type UICollection = Omit<BannerCollection, 'items'> & { items: UIItem[] }

type Lang = 'vi' | 'en'
const LANGS: Lang[] = ['vi', 'en']

const genUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

// Pending upload state (files/previews/viewports) is per item AND per locale, since each
// language can carry its own image.
const pendingKey = (uid: string, lang: Lang): string => `${uid}:${lang}`

const toUICollection = (c: BannerCollection): UICollection => ({
  ...c,
  items: c.items.map((item) => ({ ...item, _uid: genUid() }))
})

export default function BannersCollectionDialog({ open, onClose, existingConfig, takenSuffixes }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() => toUICollection(defaultBannerCollection()))
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  // Staged files only have a blob: URL, which can't carry a viewport, so it's held here until upload.
  const [pendingViewports, setPendingViewports] = useState<Record<string, ImageViewport | null>>({})
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [keySuffix, setKeySuffix] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const initial = existingConfig ? parseBannerCollection(existingConfig.value.value) : defaultBannerCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setPendingFiles({})
    setPendingViewports({})
    Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    setPendingPreviews({})
    setOpenItemIds(ui.items.length === 1 ? [ui.items[0]._uid] : [])
    setKeySuffix(existingConfig ? bannerKeySuffix(existingConfig.key) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingConfig])

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setCollection((prev) => {
      const item = prev.items[index]
      if (item) {
        for (const lang of LANGS) {
          const key = pendingKey(item._uid, lang)
          if (pendingPreviews[key]) URL.revokeObjectURL(pendingPreviews[key])
        }
        setPendingPreviews((prev) => {
          const next = { ...prev }
          for (const lang of LANGS) delete next[pendingKey(item._uid, lang)]
          return next
        })
        setPendingFiles((prev) => {
          const next = { ...prev }
          for (const lang of LANGS) delete next[pendingKey(item._uid, lang)]
          return next
        })
        setPendingViewports((prev) => {
          const next = { ...prev }
          for (const lang of LANGS) delete next[pendingKey(item._uid, lang)]
          return next
        })
      }
      return { ...prev, items: prev.items.filter((_, i) => i !== index) }
    })
  }

  const setPendingFileForItem = (uid: string, lang: Lang, file: File) => {
    const key = pendingKey(uid, lang)
    setPendingFiles((prev) => ({ ...prev, [key]: file }))
    // A new picture resets the viewport rather than reusing the old one's framing.
    setPendingViewports((prev) => ({ ...prev, [key]: null }))
    setPendingPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key])
      return { ...prev, [key]: URL.createObjectURL(file) }
    })
  }

  const clearPendingFileForItem = (uid: string, lang: Lang) => {
    const key = pendingKey(uid, lang)
    if (pendingPreviews[key]) URL.revokeObjectURL(pendingPreviews[key])
    setPendingPreviews((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPendingFiles((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPendingViewports((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = (): string | null => {
    if (!existingConfig) {
      const trimmed = keySuffix.trim()
      if (!trimmed) return t('configsPage.collectionKey.errors.required')
      if (!COLLECTION_KEY_SUFFIX_PATTERN.test(trimmed)) return t('configsPage.collectionKey.errors.invalid')
      if (takenSuffixes?.has(trimmed)) return t('configsPage.collectionKey.errors.duplicate')
    }
    for (let i = 0; i < collection.items.length; i++) {
      const item = collection.items[i]
      if (!item.slot.trim()) return t('configsPage.bannersDialog.errors.slotRequired', { index: i + 1 })
      // Vietnamese is the default locale, so it's the one required image; English falls back to it.
      if (!item.image.vi.trim() && !pendingFiles[pendingKey(item._uid, 'vi')])
        return t('configsPage.bannersDialog.errors.imageRequired', { index: i + 1 })
      if (!item.href.trim()) return t('configsPage.bannersDialog.errors.hrefRequired', { index: i + 1 })
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
        let image = item.image
        for (const lang of LANGS) {
          const key = pendingKey(item._uid, lang)
          const pending = pendingFiles[key]
          if (!pending) continue
          const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
          if (!url) {
            setIsSaving(false)
            return
          }
          image = { ...image, [lang]: encodeImageViewport(url, pendingViewports[key] ?? null) }
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
      <DialogContent
        position='top-center'
        className='flex min-w-5xl flex-col gap-0 p-0 overflow-hidden'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 pt-6 pb-3'>
          <DialogTitle>{t('configsPage.bannersDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.bannersDialog.subtitle')}</p>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 pb-4'>
          <div className='mb-4'>
            <CollectionKeyField
              prefix={BANNERS_KEY_PREFIX}
              suffix={keySuffix}
              onChange={setKeySuffix}
              locked={Boolean(existingConfig)}
              label={t('configsPage.collectionKey.field')}
              placeholder={t('configsPage.collectionKey.placeholder')}
              description={t('configsPage.collectionKey.description')}
              takenSuffixes={takenSuffixes}
              duplicateHint={t('configsPage.collectionKey.errors.duplicate')}
              invalidHint={t('configsPage.collectionKey.errors.invalid')}
              requiredHint={t('configsPage.collectionKey.errors.required')}
            />
          </div>

          <div className='rounded-xl border bg-muted/30 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm font-semibold'>{t('configsPage.bannersDialog.section.title')}</div>
                <div className='text-xs text-muted-foreground'>{t('configsPage.bannersDialog.section.subtitle')}</div>
              </div>
              <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
                {t('configsPage.bannersDialog.section.enabled')}
                <Switch
                  checked={collection.section.enabled}
                  onCheckedChange={(checked) =>
                    setCollection((prev) => ({ ...prev, section: { ...prev.section, enabled: checked } }))
                  }
                />
              </Label>
            </div>
          </div>

          <div className='mt-5 flex items-center justify-between'>
            <div>
              <div className='text-sm font-semibold'>{t('configsPage.bannersDialog.items.title')}</div>
              <div className='text-xs text-muted-foreground'>
                {t('configsPage.bannersDialog.items.subtitle', { count: collection.items.length })}
              </div>
            </div>
            <Button type='button' variant='outline' size='sm' onClick={addItem}>
              <Plus className='size-3.5' data-icon='inline-start' />
              {t('configsPage.bannersDialog.items.add')}
            </Button>
          </div>

          {collection.items.length === 0 ? (
            <div className='mt-4 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
              {t('configsPage.bannersDialog.items.empty')}
            </div>
          ) : (
            <Accordion
              type='multiple'
              value={openItemIds}
              onValueChange={setOpenItemIds}
              className='mt-3 space-y-2 rounded-2xl'
            >
              {collection.items.map((item, index) => (
                <BannerRow
                  key={item._uid}
                  uid={item._uid}
                  index={index}
                  item={item}
                  knownSlots={knownSlots}
                  pendingPreviewUrl={(lang) => pendingPreviews[pendingKey(item._uid, lang)]}
                  pendingViewport={(lang) => pendingViewports[pendingKey(item._uid, lang)] ?? null}
                  onPendingViewportChange={(lang, viewport) =>
                    setPendingViewports((prev) => ({ ...prev, [pendingKey(item._uid, lang)]: viewport }))
                  }
                  onChange={(patch) => updateItem(index, patch)}
                  onRemove={() => removeItem(index)}
                  onPickFile={(lang, file) => setPendingFileForItem(item._uid, lang, file)}
                  onClearPendingFile={(lang) => clearPendingFileForItem(item._uid, lang)}
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
          <Button type='button' disabled={submitting} onClick={handleSave}>
            {submitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {submitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  // A single language switch drives both the image and the alt text for this item,
  // instead of each field having its own independent VI/EN tabs.
  const [lang, setLang] = useState<Lang>('vi')

  // The header thumbnail shows the VI image (the required, default-locale one), falling back to EN
  // for items whose VI image hasn't been picked yet.
  const headerLang: Lang = item.image.vi || pendingPreviewUrl('vi') ? 'vi' : 'en'
  const headerPreview = pendingPreviewUrl(headerLang) || item.image[headerLang] || ''
  const headerViewport = pendingPreviewUrl(headerLang)
    ? pendingViewport(headerLang)
    : decodeImageViewport(item.image[headerLang]).viewport

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex items-center gap-2 border rounded-xl bg-muted w-full'>
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

      <AccordionContent className='p-4 rounded-b-2xl'>
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
