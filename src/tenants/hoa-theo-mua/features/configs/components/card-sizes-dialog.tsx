import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Info, Plus, Ruler, SaveIcon, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CARD_CONFIG_GROUP,
  CARD_SIZES_KEY,
  defaultCardSize,
  defaultCardSizes,
  findCardSizesIssue,
  parseCardSizes,
  type CardSize
} from '../card-config-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'

interface CardSizesDialogProps {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

type NumericField = 'width' | 'height' | 'base_price' | 'max_words'

const NUMERIC_FIELDS: { field: NumericField; step: number }[] = [
  { field: 'width', step: 0.5 },
  { field: 'height', step: 0.5 },
  { field: 'base_price', step: 1000 },
  { field: 'max_words', step: 1 }
]

export default function CardSizesDialog({ open, onClose, existingConfig }: CardSizesDialogProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [configLabel, setConfigLabel] = useState('')
  const [sizes, setSizes] = useState<CardSize[]>(defaultCardSizes)
  const [isSaving, setIsSaving] = useState(false)

  const fallbackConfigLabel = t('configsPage.cardSizesDialog.configLabelFallback')

  useEffect(() => {
    if (!open) return

    setConfigLabel(existingConfig?.value.label || fallbackConfigLabel)

    const parsed = existingConfig ? parseCardSizes(existingConfig.value.value) : []
    setSizes(parsed.length > 0 ? parsed : defaultCardSizes())
  }, [open, existingConfig, fallbackConfigLabel])

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
      const body: CreateConfigFormValues = {
        key: CARD_SIZES_KEY,
        isPublic: true,
        group: CARD_CONFIG_GROUP,
        kind: ConfigKind.setting,
        value: {
          group: CARD_CONFIG_GROUP,
          label: configLabel.trim(),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          value: JSON.stringify({ items: sizes.map((size) => ({ ...size, name: size.name.trim() })) })
        }
      }

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      await queryClient.invalidateQueries({ queryKey: ['configs'] })
      onClose()
    } catch (error) {
      // BE trả 409 khi có hơn một record active cho cùng (group, key).
      const messageCode = isAxiosError<ErrorResponse>(error) ? error.response?.data?.messageCode : undefined
      toast.error(
        messageCode === 'CARD_CONFIG_AMBIGUOUS'
          ? t('configsPage.cardSizesDialog.errors.ambiguous')
          : t('configKeys.toast.error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !isSaving && onClose()}>
      <DialogContent position='top-center' className='flex flex-col gap-0 overflow-hidden p-0 sm:min-w-3xl'>
        <DialogHeader className='px-6 pt-6 pb-3'>
          <div className='flex items-center gap-3'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600'>
              <Ruler className='size-5' />
            </span>
            <div>
              <DialogTitle>{t('configsPage.cardSizesDialog.title')}</DialogTitle>
              <p className='mt-1 text-xs text-muted-foreground'>{t('configsPage.cardSizesDialog.description')}</p>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-5'>
          <div className='flex items-start gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2'>
            <Info className='mt-0.5 size-3.5 shrink-0 text-sky-600' />
            <p className='text-xs text-sky-800'>{t('configsPage.cardSizesDialog.hint')}</p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='card-sizes-label'>{t('configsPage.cardSizesDialog.configLabel')}</Label>
            <Input
              id='card-sizes-label'
              value={configLabel}
              onChange={(event) => setConfigLabel(event.target.value)}
              placeholder={fallbackConfigLabel}
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold'>{t('configsPage.cardSizesDialog.sizesTitle')}</p>
                <p className='text-xs text-muted-foreground'>{t('configsPage.cardSizesDialog.sizesSubtitle')}</p>
              </div>
              <Button type='button' variant='outline' size='sm' onClick={addSize}>
                <Plus className='size-3.5' />
                {t('configsPage.cardSizesDialog.addSize')}
              </Button>
            </div>

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
          </div>

          {issue ? (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2'>
              <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-destructive' />
              <p className='text-xs text-destructive'>{t(`configsPage.cardSizesDialog.errors.${issue.code}`)}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button type='button' variant='outline' disabled={isSaving} onClick={onClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='button' disabled={isSaving} onClick={save}>
            {isSaving ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSaving ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
