import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ExternalLink,
  ImageIcon,
  LinkIcon,
  Plus,
  SaveIcon,
  Trash2,
  UploadIcon
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  BANNERS_GROUP,
  BANNERS_KEY_PREFIX,
  bannerKeySuffix,
  collectSlotKeys,
  defaultBannerCollection,
  defaultBannerItem,
  parseBannerCollection,
  type BannerCollection,
  type BannerItem
} from '../banners-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import { COLLECTION_KEY_SUFFIX_PATTERN, CollectionKeyField, LocalizedTabs } from './collection-shared'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
  takenSuffixes?: Set<string>
}

type UIItem = BannerItem & { _uid: string }
type UICollection = Omit<BannerCollection, 'items'> & { items: UIItem[] }

const genUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

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
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [keySuffix, setKeySuffix] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const initial = existingConfig ? parseBannerCollection(existingConfig.value.value) : defaultBannerCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setPendingFiles({})
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

  const knownSlots = collectSlotKeys(collection.items)

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
    if (!existingConfig) {
      const trimmed = keySuffix.trim()
      if (!trimmed) return t('configsPage.collectionKey.errors.required')
      if (!COLLECTION_KEY_SUFFIX_PATTERN.test(trimmed)) return t('configsPage.collectionKey.errors.invalid')
      if (takenSuffixes?.has(trimmed)) return t('configsPage.collectionKey.errors.duplicate')
    }
    for (let i = 0; i < collection.items.length; i++) {
      const item = collection.items[i]
      if (!item.slot.trim()) return t('configsPage.bannersDialog.errors.slotRequired', { index: i + 1 })
      if (!item.image && !pendingFiles[item._uid])
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
        const pending = pendingFiles[item._uid]
        if (!pending) continue
        const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
        if (!url) {
          setIsSaving(false)
          return
        }
        uiItems[i] = { ...item, image: url }
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
                  total={collection.items.length}
                  item={item}
                  knownSlots={knownSlots}
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
  total,
  item,
  knownSlots,
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
  item: BannerItem
  knownSlots: string[]
  pendingPreviewUrl?: string
  onChange: (patch: Partial<BannerItem>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const datalistId = `banner-slot-suggestions-${uid}`
  const displayPreview = pendingPreviewUrl || item.image || ''
  const displayLabel = item.slot || t('configsPage.bannersDialog.item.untitled', { index: index + 1 })

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex items-center gap-2 border rounded-xl bg-muted w-full'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <div className='h-10 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted'>
              {displayPreview ? (
                <img src={displayPreview} alt='' className='size-full object-cover' />
              ) : (
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              )}
            </div>
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
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('configsPage.bannersDialog.item.moveUp')}
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
            aria-label={t('configsPage.bannersDialog.item.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Switch
            checked={item.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
            className='ml-1'
          />
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]'>
          <div className='space-y-2'>
            <FieldLabel className='text-xs'>{t('configsPage.bannersDialog.item.image')}</FieldLabel>
            <div className='mt-1 aspect-[16/9] overflow-hidden rounded-lg border bg-muted'>
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
                  ? t('configsPage.bannersDialog.item.replaceImage')
                  : t('configsPage.bannersDialog.item.uploadImage')}
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

            <FieldDescription className='text-xs'>{t('configsPage.bannersDialog.item.imageHelp')}</FieldDescription>
          </div>

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

            <LocalizedTabs
              viLabel={t('configsPage.bannersDialog.locale.vi')}
              enLabel={t('configsPage.bannersDialog.locale.en')}
              renderField={(lang) => (
                <Field className='gap-1'>
                  <FieldLabel>{t('configsPage.bannersDialog.item.altField')}</FieldLabel>
                  <Input
                    value={item.alt[lang]}
                    onChange={(e) => onChange({ alt: { ...item.alt, [lang]: e.target.value } })}
                    placeholder={t('configsPage.bannersDialog.item.altPlaceholder')}
                  />
                  <FieldDescription className='text-xs'>{t('configsPage.bannersDialog.item.altHelp')}</FieldDescription>
                </Field>
              )}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
