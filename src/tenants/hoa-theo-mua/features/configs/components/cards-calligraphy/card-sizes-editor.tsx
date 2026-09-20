import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CARD_SIZES_KEY,
  defaultCardSize,
  defaultCardSizes,
  findCardSizesIssue,
  parseCardSizes
} from '../../card-config-palette'
import { configKeys } from '../../query-keys'
import { type CardSize, type Config } from '../../types'
import EditorCallout from '../settings/editor-callout'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'
import { isAmbiguousCardConfigError, saveCardConfigDocument } from './save-card-config'

interface CardSizesEditorProps {
  /** `null` là tạo mới singleton; ngược lại sửa tại chỗ bản ghi đang có. */
  existingConfig: Config | null
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  onSaved?: () => void
}

const snapshot = (label: string, sizes: CardSize[]) => JSON.stringify({ label, sizes })

type NumericField = 'width' | 'height' | 'base_price' | 'max_words'

const NUMERIC_FIELDS: { field: NumericField; step: number }[] = [
  { field: 'width', step: 0.5 },
  { field: 'height', step: 0.5 },
  { field: 'base_price', step: 1000 },
  { field: 'max_words', step: 1 }
]

export default function CardSizesEditor({ existingConfig, onBack, onSaved }: CardSizesEditorProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [configLabel, setConfigLabel] = useState('')
  const [sizes, setSizes] = useState<CardSize[]>(defaultCardSizes)
  const [isSaving, setIsSaving] = useState(false)
  const [baseline, setBaseline] = useState('')

  const fallbackConfigLabel = t('configsPage.cardSizesDialog.configLabelFallback')

  useEffect(() => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const parsed = existingConfig ? parseCardSizes(existingConfig.value.value) : []
    const nextSizes = parsed.length > 0 ? parsed : defaultCardSizes()

    setConfigLabel(label)
    setSizes(nextSizes)
    setBaseline(snapshot(label, nextSizes))
  }, [existingConfig, fallbackConfigLabel])

  // So với snapshot lần lưu gần nhất để shell đăng ký dirty với registry của cả trang.
  const isDirty = snapshot(configLabel, sizes) !== baseline

  const revert = () => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const parsed = existingConfig ? parseCardSizes(existingConfig.value.value) : []
    const nextSizes = parsed.length > 0 ? parsed : defaultCardSizes()
    setConfigLabel(label)
    setSizes(nextSizes)
    setBaseline(snapshot(label, nextSizes))
  }

  const issue = useMemo(() => findCardSizesIssue(sizes), [sizes])

  const setField = (index: number, field: keyof CardSize, raw: string) => {
    setSizes((current) =>
      current.map((size, i) =>
        i === index ? { ...size, [field]: field === 'name' ? raw : raw === '' ? 0 : Number(raw) } : size
      )
    )
  }

  const addSize = () => setSizes((current) => [...current, defaultCardSize()])

  const removeSize = (index: number) => setSizes((current) => current.filter((_, i) => i !== index))

  const save = async () => {
    if (!configLabel.trim()) {
      toast.error(t('configsPage.cardSizesDialog.errors.labelRequired'))
      return
    }

    if (issue) {
      toast.error(t(`configsPage.cardSizesDialog.errors.${issue.code}`))
      return
    }

    setIsSaving(true)
    try {
      const outcome = await saveCardConfigDocument({
        key: CARD_SIZES_KEY,
        label: configLabel.trim(),
        items: sizes.map((size) => ({ ...size, name: size.name.trim() })),
        existingConfig
      })
      toast.success(t(outcome === 'created' ? 'configKeys.toast.created' : 'configKeys.toast.updated'))

      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      // Đặt lại baseline rồi đóng bằng `onSaved`, KHÔNG dùng `onBack`. `onBack` là lối thoát có
      // guard, mà registry chỉ biết editor này đã sạch ở lượt flush effect kế tiếp - đi đường đó
      // sẽ chạy đua với lượt flush ấy và bật hộp thoại hỏi bỏ đúng phần vừa lưu.
      setBaseline(snapshot(configLabel, sizes))
      onSaved?.()
    } catch (error) {
      toast.error(
        isAmbiguousCardConfigError(error)
          ? t('configsPage.cardSizesDialog.errors.ambiguous')
          : t('configKeys.toast.error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <InlineEditorShell
      editorId={CARD_SIZES_KEY}
      title={t('configsPage.cardSizesDialog.title')}
      description={t('configsPage.cardSizesDialog.description')}
      isDirty={isDirty}
      isSaving={isSaving}
      onRevert={revert}
      onSave={save}
      onBack={onBack}
    >
      <EditorCallout>{t('configsPage.cardSizesDialog.hint')}</EditorCallout>

      <EditorSection title={t('configsPage.cardSizesDialog.configLabel')}>
        <Input
          id='card-sizes-label'
          aria-label={t('configsPage.cardSizesDialog.configLabel')}
          value={configLabel}
          onChange={(event) => setConfigLabel(event.target.value)}
          placeholder={fallbackConfigLabel}
        />
      </EditorSection>

      <EditorSection
        title={t('configsPage.cardSizesDialog.sizesTitle')}
        description={t('configsPage.cardSizesDialog.sizesSubtitle')}
        action={
          <Button type='button' variant='outline' size='sm' onClick={addSize}>
            <Plus className='size-3.5' />
            {t('configsPage.cardSizesDialog.addSize')}
          </Button>
        }
      >
        {sizes.length === 0 ? (
          <p className='rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground'>
            {t('configsPage.cardSizesDialog.emptySizes')}
          </p>
        ) : (
          <div className='space-y-3'>
            {sizes.map((size, index) => (
              <div key={index} className='space-y-3 rounded-xl border bg-muted/30 p-3'>
                <div className='flex items-end gap-3'>
                  <div className='min-w-0 flex-1 space-y-1.5'>
                    <Label htmlFor={`card-size-${index}-name`} className='text-xs'>
                      {t('configsPage.cardSizesDialog.fields.name')}
                    </Label>
                    <Input
                      id={`card-size-${index}-name`}
                      value={size.name}
                      onChange={(event) => setField(index, 'name', event.target.value)}
                      placeholder={t('configsPage.cardSizesDialog.namePlaceholder')}
                    />
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 text-muted-foreground hover:text-destructive'
                    onClick={() => removeSize(index)}
                  >
                    <Trash2 className='size-4' />
                    <span className='sr-only'>{t('configsPage.cardSizesDialog.removeSize')}</span>
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  {NUMERIC_FIELDS.map(({ field, step }) => (
                    <div key={field} className='space-y-1.5'>
                      <Label htmlFor={`card-size-${index}-${field}`} className='text-xs'>
                        {t(`configsPage.cardSizesDialog.fields.${field}`)}
                      </Label>
                      <Input
                        id={`card-size-${index}-${field}`}
                        type='number'
                        min={0}
                        step={step}
                        value={String(size[field])}
                        onChange={(event) => setField(index, field, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </EditorSection>

      {issue ? (
        <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2'>
          <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-destructive' />
          <p className='text-xs text-destructive'>{t(`configsPage.cardSizesDialog.errors.${issue.code}`)}</p>
        </div>
      ) : null}
    </InlineEditorShell>
  )
}
