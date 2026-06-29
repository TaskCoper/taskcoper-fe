import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ChevronsUpDown, ImageIcon, Plus, SaveIcon, Trash2, UploadIcon, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  defaultOccasionCard,
  defaultOccasionCollection,
  OCCASIONS_COLLECTION_KEY,
  OCCASIONS_GROUP,
  parseOccasionCollection,
  slugify,
  type OccasionCard,
  type OccasionCollection
} from '../occasions-palette'
import configService from '../services'
import { InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'

interface Props {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

type Lang = 'vi' | 'en'

type UICard = OccasionCard & { _uid: string }
type UICollection = Omit<OccasionCollection, 'cards'> & { cards: UICard[] }

const genCardUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

const toUICollection = (c: OccasionCollection): UICollection => ({
  ...c,
  cards: c.cards.map((card) => ({ ...card, _uid: genCardUid() }))
})

export default function OccasionsCollectionDialog({ open, onClose, existingConfig }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() => toUICollection(defaultOccasionCollection()))
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  const [openCardIds, setOpenCardIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const initial = existingConfig ? parseOccasionCollection(existingConfig.value.value) : defaultOccasionCollection()
    const ui = toUICollection(initial)
    setCollection(ui)
    setPendingFiles({})
    Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    setPendingPreviews({})
    setOpenCardIds(ui.cards.length === 1 ? [ui.cards[0]._uid] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingConfig])

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const usedIds = useMemo(() => new Set(collection.cards.map((c) => c.id)), [collection.cards])

  const updateSection = (patch: Partial<OccasionCollection['section']>) =>
    setCollection((prev) => ({ ...prev, section: { ...prev.section, ...patch } }))

  const updateCard = useCallback((index: number, patch: Partial<OccasionCard>) => {
    setCollection((prev) => {
      const next = [...prev.cards]
      next[index] = { ...next[index], ...patch }
      return { ...prev, cards: next }
    })
  }, [])

  const addCard = () => {
    const card: UICard = { ...defaultOccasionCard(), _uid: genCardUid() }
    setCollection((prev) => ({ ...prev, cards: [...prev.cards, card] }))
    setOpenCardIds((prev) => [...prev, card._uid])
  }

  const removeCard = (index: number) => {
    setCollection((prev) => {
      const card = prev.cards[index]
      if (card && pendingPreviews[card._uid]) {
        URL.revokeObjectURL(pendingPreviews[card._uid])
        setPendingPreviews((prev) => {
          const next = { ...prev }
          delete next[card._uid]
          return next
        })
        setPendingFiles((prev) => {
          const next = { ...prev }
          delete next[card._uid]
          return next
        })
      }
      return { ...prev, cards: prev.cards.filter((_, i) => i !== index) }
    })
  }

  const moveCard = (from: number, to: number) => {
    if (to < 0 || to >= collection.cards.length) return
    setCollection((prev) => {
      const next = [...prev.cards]
      const [picked] = next.splice(from, 1)
      next.splice(to, 0, picked)
      return { ...prev, cards: next }
    })
  }

  const setPendingFileForCard = (cardUid: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [cardUid]: file }))
    setPendingPreviews((prev) => {
      if (prev[cardUid]) URL.revokeObjectURL(prev[cardUid])
      return { ...prev, [cardUid]: URL.createObjectURL(file) }
    })
  }

  const validate = (): string | null => {
    if (!collection.section.title.vi.trim()) return t('configsPage.occasionsDialog.errors.sectionTitleRequired')

    const seen = new Set<string>()
    for (let i = 0; i < collection.cards.length; i++) {
      const card = collection.cards[i]
      const slug = card.id.trim()
      if (!slug) return t('configsPage.occasionsDialog.errors.slugRequired', { index: i + 1 })
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug))
        return t('configsPage.occasionsDialog.errors.slugInvalid', { index: i + 1 })
      if (seen.has(slug)) return t('configsPage.occasionsDialog.errors.slugDuplicate', { slug })
      seen.add(slug)
      if (!card.name.vi.trim()) return t('configsPage.occasionsDialog.errors.nameRequired', { index: i + 1 })
      if (!card.image && !pendingFiles[card._uid])
        return t('configsPage.occasionsDialog.errors.imageRequired', { index: i + 1 })
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
      // 1. Upload any pending images and patch their URLs into the cards.
      const uiCards = [...collection.cards]
      for (let i = 0; i < uiCards.length; i++) {
        const card = uiCards[i]
        const pending = pendingFiles[card._uid]
        if (!pending) continue
        const url = await uploadFileWithToast({ file: pending, showSuccessToast: false })
        if (!url) {
          setIsSaving(false)
          return
        }
        uiCards[i] = { ...card, image: url }
      }

      // _uid is dialog-only UI state; strip before persisting.
      const resolved: OccasionCollection = {
        ...collection,
        cards: uiCards.map((card) => {
          const stripped: Partial<UICard> = { ...card }
          delete stripped._uid
          return stripped as OccasionCard
        })
      }

      // 2. Build the config body and upsert.
      const body: CreateConfigFormValues = {
        key: OCCASIONS_COLLECTION_KEY,
        isPublic: true,
        group: OCCASIONS_GROUP,
        value: {
          group: OCCASIONS_GROUP,
          label: t('configsPage.occasionsDialog.configLabel'),
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
          <DialogTitle>{t('configsPage.occasionsDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.occasionsDialog.subtitle')}</p>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 pb-4'>
          <SectionHeaderForm value={collection.section} onChange={updateSection} />

          <div className='mt-5 flex items-center justify-between'>
            <div>
              <div className='text-sm font-semibold'>{t('configsPage.occasionsDialog.cards.title')}</div>
              <div className='text-xs text-muted-foreground'>
                {t('configsPage.occasionsDialog.cards.subtitle', { count: collection.cards.length })}
              </div>
            </div>
            <Button type='button' variant='outline' size='sm' onClick={addCard}>
              <Plus className='size-3.5' data-icon='inline-start' />
              {t('configsPage.occasionsDialog.cards.add')}
            </Button>
          </div>

          {collection.cards.length === 0 ? (
            <div className='mt-4 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
              {t('configsPage.occasionsDialog.cards.empty')}
            </div>
          ) : (
            <Accordion
              type='multiple'
              value={openCardIds}
              onValueChange={setOpenCardIds}
              className='mt-3 space-y-2 rounded-2xl'
            >
              {collection.cards.map((card, index) => (
                <CardRow
                  key={card._uid}
                  uid={card._uid}
                  index={index}
                  total={collection.cards.length}
                  card={card}
                  pendingPreviewUrl={pendingPreviews[card._uid]}
                  onChange={(patch) => updateCard(index, patch)}
                  onRemove={() => removeCard(index)}
                  onMove={(dir) => moveCard(index, index + dir)}
                  onPickFile={(file) => setPendingFileForCard(card._uid, file)}
                  onClearPendingFile={() => {
                    if (pendingPreviews[card._uid]) URL.revokeObjectURL(pendingPreviews[card._uid])
                    setPendingPreviews((prev) => {
                      const next = { ...prev }
                      delete next[card._uid]
                      return next
                    })
                    setPendingFiles((prev) => {
                      const next = { ...prev }
                      delete next[card._uid]
                      return next
                    })
                  }}
                  usedIds={usedIds}
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

function SectionHeaderForm({
  value,
  onChange
}: {
  value: OccasionCollection['section']
  onChange: (patch: Partial<OccasionCollection['section']>) => void
}) {
  const { t } = useTenantTranslation()

  return (
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-sm font-semibold'>{t('configsPage.occasionsDialog.section.title')}</div>
          <div className='text-xs text-muted-foreground'>{t('configsPage.occasionsDialog.section.subtitle')}</div>
        </div>
        <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
          {t('configsPage.occasionsDialog.section.enabled')}
          <Switch checked={value.enabled} onCheckedChange={(checked) => onChange({ enabled: checked })} />
        </Label>
      </div>

      <LocalizedTabs
        renderField={(lang) => (
          <div className='space-y-2'>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.occasionsDialog.section.titleField')}</FieldLabel>
              <Input
                value={value.title[lang]}
                onChange={(e) => onChange({ title: { ...value.title, [lang]: e.target.value } })}
                placeholder={t('configsPage.occasionsDialog.section.titlePlaceholder')}
              />
            </Field>
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.occasionsDialog.section.descriptionField')}</FieldLabel>
              <Textarea
                rows={2}
                value={value.description[lang]}
                onChange={(e) => onChange({ description: { ...value.description, [lang]: e.target.value } })}
                placeholder={t('configsPage.occasionsDialog.section.descriptionPlaceholder')}
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
          {t('configsPage.occasionsDialog.locale.vi')}
        </TabsTrigger>
        <TabsTrigger value='en' className='text-xs'>
          {t('configsPage.occasionsDialog.locale.en')}
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

function CardRow({
  uid,
  index,
  total,
  card,
  pendingPreviewUrl,
  onChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile,
  usedIds
}: {
  uid: string
  index: number
  total: number
  card: OccasionCard
  pendingPreviewUrl?: string
  onChange: (patch: Partial<OccasionCard>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
  usedIds: Set<string>
}) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || card.image || ''
  const displayName = card.name.vi || t('configsPage.occasionsDialog.card.untitled', { index: index + 1 })

  const handleNameBlur = (lang: Lang, value: string) => {
    if (lang === 'vi' && !card.id) {
      let candidate = slugify(value) || `card-${index + 1}`
      let n = 2
      while (usedIds.has(candidate)) candidate = `${slugify(value) || 'card'}-${n++}`
      onChange({ id: candidate })
    }
  }

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
              <span className='truncate text-xs text-muted-foreground'>
                {card.id ? `/${card.id}` : t('configsPage.occasionsDialog.card.noSlug')}
              </span>
            </div>
            {!card.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.occasionsDialog.card.disabled')}
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
            aria-label={t('configsPage.occasionsDialog.card.moveUp')}
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
            aria-label={t('configsPage.occasionsDialog.card.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Switch
            checked={card.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
            className='ml-1'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.occasionsDialog.card.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='p-4 rounded-b-2xl'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]'>
          {/* Image upload */}
          <div>
            <FieldLabel className='text-xs'>{t('configsPage.occasionsDialog.card.image')}</FieldLabel>
            <div className='mt-1 aspect-square overflow-hidden rounded-md border bg-muted'>
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
                  ? t('configsPage.occasionsDialog.card.replaceImage')
                  : t('configsPage.occasionsDialog.card.uploadImage')}
              </Button>
              {(pendingPreviewUrl || card.image) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    onChange({ image: '' })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>
          </div>

          {/* Right column — text + filters */}
          <div className='space-y-4'>
            <LocalizedTabs
              renderField={(lang) => (
                <div className='space-y-2'>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.occasionsDialog.card.badgeField')}</FieldLabel>
                    <Input
                      value={card.badge[lang]}
                      onChange={(e) => onChange({ badge: { ...card.badge, [lang]: e.target.value } })}
                      placeholder={t('configsPage.occasionsDialog.card.badgePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.occasionsDialog.card.nameField')}</FieldLabel>
                    <Input
                      value={card.name[lang]}
                      onChange={(e) => onChange({ name: { ...card.name, [lang]: e.target.value } })}
                      onBlur={(e) => handleNameBlur(lang, e.target.value)}
                      placeholder={t('configsPage.occasionsDialog.card.namePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.occasionsDialog.card.descriptionField')}</FieldLabel>
                    <Textarea
                      rows={2}
                      value={card.description[lang]}
                      onChange={(e) => onChange({ description: { ...card.description, [lang]: e.target.value } })}
                      placeholder={t('configsPage.occasionsDialog.card.descriptionPlaceholder')}
                    />
                  </Field>
                </div>
              )}
            />

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.occasionsDialog.card.slugField')}</FieldLabel>
              <Input value={card.id} onChange={(e) => onChange({ id: e.target.value })} className='font-mono text-sm' />
              <FieldDescription className='text-xs'>{t('configsPage.occasionsDialog.card.slugHelp')}</FieldDescription>
            </Field>

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.occasionsDialog.card.categoryIdsField')}</FieldLabel>
              <ChipInput
                values={card.categoryIds}
                onChange={(next) => onChange({ categoryIds: next })}
                placeholder={t('configsPage.occasionsDialog.card.categoryIdsPlaceholder')}
              />
              <FieldDescription className='text-xs'>
                {t('configsPage.occasionsDialog.card.categoryIdsHelp')}
              </FieldDescription>
            </Field>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function ChipInput({
  values,
  onChange,
  placeholder
}: {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,\n\t]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...values]
    for (const p of parts) if (!next.includes(p)) next.push(p)
    onChange(next)
    setDraft('')
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-xl border bg-background p-2'>
      {values.map((v) => (
        <Badge key={v} variant='secondary' className='gap-1 font-mono'>
          {v}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-3.5 text-muted-foreground hover:bg-transparent hover:text-destructive'
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label='remove'
          >
            <X className='size-3' />
          </Button>
        </Badge>
      ))}

      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit(draft)
          } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
            onChange(values.slice(0, -1))
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (/[,\n\t]/.test(text)) {
            e.preventDefault()
            commit(text)
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={placeholder}
        // className='h-auto min-w-32 flex-1 border-0 ring-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
      />
    </div>
  )
}
