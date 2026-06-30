import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, SaveIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  defaultOccasionCard,
  defaultOccasionCollection,
  OCCASIONS_COLLECTION_KEY,
  OCCASIONS_GROUP,
  parseOccasionCollection,
  type OccasionCard,
  type OccasionCollection
} from '../occasions-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import OccasionsCardRow from './occasions-card-row'

interface Props {
  existingConfig: Config | null
  onSaved?: (config: Config | undefined) => void
  onCancel?: () => void
}

type Lang = 'vi' | 'en'

type UICard = OccasionCard & { _uid: string }
type UICollection = Omit<OccasionCollection, 'cards'> & { cards: UICard[] }

const genCardUid = (): string => `u_${Math.random().toString(36).slice(2, 8)}`

const toUICollection = (c: OccasionCollection): UICollection => ({
  ...c,
  cards: c.cards.map((card) => ({ ...card, _uid: genCardUid() }))
})

export default function OccasionsCollectionEditor({ existingConfig, onSaved, onCancel }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [collection, setCollection] = useState<UICollection>(() =>
    toUICollection(existingConfig ? parseOccasionCollection(existingConfig.value.value) : defaultOccasionCollection())
  )
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({})
  const [openCardIds, setOpenCardIds] = useState<string[]>(() =>
    collection.cards.length === 1 ? [collection.cards[0]._uid] : []
  )
  const [isSaving, setIsSaving] = useState(false)

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

      const seenCampaignIds = new Set<string>()
      for (let j = 0; j < card.campaigns.length; j++) {
        const ca = card.campaigns[j]
        const cargs = { cardIndex: i + 1, index: j + 1 }
        const cid = ca.id.trim()
        if (!cid) return t('configsPage.occasionsDialog.errors.campaignIdRequired', cargs)
        if (!/^[a-z0-9][a-z0-9-]*$/.test(cid)) return t('configsPage.occasionsDialog.errors.campaignIdInvalid', cargs)
        if (seenCampaignIds.has(cid))
          return t('configsPage.occasionsDialog.errors.campaignIdDuplicate', { ...cargs, id: cid })
        seenCampaignIds.add(cid)
        if (!ca.campaignName.vi.trim()) return t('configsPage.occasionsDialog.errors.campaignNameRequired', cargs)
        if (!ca.skuPrefix.trim()) return t('configsPage.occasionsDialog.errors.campaignSkuRequired', cargs)
        if (!ca.startDate || !ca.endDate) return t('configsPage.occasionsDialog.errors.campaignDatesRequired', cargs)
        if (ca.startDate > ca.endDate) return t('configsPage.occasionsDialog.errors.campaignDatesInvalid', cargs)
      }
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

      const resolved: OccasionCollection = {
        ...collection,
        cards: uiCards.map((card) => {
          const stripped: Partial<UICard> = { ...card }
          delete stripped._uid
          return stripped as OccasionCard
        })
      }

      const body: CreateConfigFormValues = {
        key: OCCASIONS_COLLECTION_KEY,
        isPublic: true,
        kind: ConfigKind.content,
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

      let saved: Config | undefined
      if (existingConfig) {
        saved = await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        saved = await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      queryClient.invalidateQueries({ queryKey: ['configs'] })
      if (saved) queryClient.invalidateQueries({ queryKey: ['config', saved.id] })
      onSaved?.(saved)
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const submitting = isSaving || isUploading

  return (
    <div className='flex flex-col gap-4'>
      <SectionHeaderForm value={collection.section} onChange={updateSection} />

      <div className='flex items-center justify-between'>
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
        <div className='rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground'>
          {t('configsPage.occasionsDialog.cards.empty')}
        </div>
      ) : (
        <Accordion type='multiple' value={openCardIds} onValueChange={setOpenCardIds} className='space-y-2 rounded-2xl'>
          {collection.cards.map((card, index) => (
            <OccasionsCardRow
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

      <div className='flex justify-end gap-2 border-t pt-4'>
        {onCancel && (
          <Button type='button' variant='outline' disabled={submitting} onClick={onCancel}>
            {t('configsPage.dialog.cancel')}
          </Button>
        )}
        <Button type='button' disabled={submitting} onClick={handleSave}>
          {submitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
          {submitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
        </Button>
      </div>
    </div>
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
