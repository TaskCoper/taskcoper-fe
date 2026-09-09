import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Info, PenLine, Plus, SaveIcon, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CARD_CONFIG_GROUP,
  CARD_PRICES_KEY,
  defaultCalligraphyRule,
  defaultCalligraphyRules,
  findCalligraphyRulesIssue,
  parseCalligraphyRules,
  sortCalligraphyRules,
  type CalligraphyRule
} from '../card-config-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'

interface CalligraphyPricingDialogProps {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
  /** `max_words` lớn nhất trong `card_config.sizes`, dùng để cảnh báo bậc giá chưa phủ hết. */
  maxWordsAcrossSizes?: number
}

type RuleField = keyof CalligraphyRule

const RULE_FIELDS: RuleField[] = ['min_words', 'max_words', 'extra_price']

export default function CalligraphyPricingDialog({
  open,
  onClose,
  existingConfig,
  maxWordsAcrossSizes = 0
}: CalligraphyPricingDialogProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [configLabel, setConfigLabel] = useState('')
  const [rules, setRules] = useState<CalligraphyRule[]>(defaultCalligraphyRules)

  const [isSaving, setIsSaving] = useState(false)

  const fallbackConfigLabel = t('configsPage.calligraphyDialog.configLabelFallback')

  useEffect(() => {
    if (!open) return

    setConfigLabel(existingConfig?.value.label || fallbackConfigLabel)
    setRules(existingConfig ? parseCalligraphyRules(existingConfig.value.value) : defaultCalligraphyRules())
  }, [open, existingConfig, fallbackConfigLabel])

  const sortedRules = useMemo(() => sortCalligraphyRules(rules), [rules])
  const issue = useMemo(() => findCalligraphyRulesIssue(rules), [rules])
  const coveredMaxWords = useMemo(
    () => sortedRules.reduce((max, rule) => Math.max(max, rule.max_words), 0),
    [sortedRules]
  )
  const isCoverageShort = maxWordsAcrossSizes > 0 && coveredMaxWords < maxWordsAcrossSizes

  const setRuleField = (index: number, field: RuleField, raw: string) => {
    setRules((current) =>
      current.map((rule, i) => (i === index ? { ...rule, [field]: raw === '' ? 0 : Number(raw) } : rule))
    )
  }

  const addRule = () => {
    setRules((current) => [...current, defaultCalligraphyRule(sortCalligraphyRules(current).at(-1))])
  }

  const removeRule = (index: number) => {
    setRules((current) => current.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!configLabel.trim()) {
      toast.error(t('configsPage.calligraphyDialog.errors.labelRequired'))
      return
    }

    if (issue) {
      toast.error(t(`configsPage.calligraphyDialog.errors.${issue.code}`))
      return
    }

    setIsSaving(true)
    try {
      const body: CreateConfigFormValues = {
        key: CARD_PRICES_KEY,
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
          value: JSON.stringify({ items: sortedRules })
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
      const messageCode = isAxiosError<ErrorResponse>(error) ? error.response?.data?.messageCode : undefined
      toast.error(
        messageCode === 'CARD_CONFIG_AMBIGUOUS'
          ? t('configsPage.calligraphyDialog.errors.ambiguous')
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
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600'>
              <PenLine className='size-5' />
            </span>
            <div>
              <DialogTitle>{t('configsPage.calligraphyDialog.title')}</DialogTitle>
              <p className='mt-1 text-xs text-muted-foreground'>{t('configsPage.calligraphyDialog.description')}</p>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-5'>
          <div className='flex items-start gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2'>
            <Info className='mt-0.5 size-3.5 shrink-0 text-sky-600' />
            <p className='text-xs text-sky-800'>{t('configsPage.calligraphyDialog.hint')}</p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='calligraphy-config-label'>{t('configsPage.calligraphyDialog.configLabel')}</Label>
            <Input
              id='calligraphy-config-label'
              value={configLabel}
              onChange={(event) => setConfigLabel(event.target.value)}
              placeholder={fallbackConfigLabel}
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold'>{t('configsPage.calligraphyDialog.rulesTitle')}</p>
                <p className='text-xs text-muted-foreground'>{t('configsPage.calligraphyDialog.rulesSubtitle')}</p>
              </div>
              <Button type='button' variant='outline' size='sm' onClick={addRule}>
                <Plus className='size-3.5' />
                {t('configsPage.calligraphyDialog.addRule')}
              </Button>
            </div>

            {rules.length === 0 ? (
              <p className='rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground'>
                {t('configsPage.calligraphyDialog.emptyRules')}
              </p>
            ) : (
              <div className='space-y-2'>
                {rules.map((rule, index) => (
                  <div key={index} className='flex items-end gap-3 rounded-xl border bg-muted/30 p-3'>
                    {RULE_FIELDS.map((field) => (
                      <div key={field} className='min-w-0 flex-1 space-y-1.5'>
                        <Label htmlFor={`calligraphy-${index}-${field}`} className='text-xs'>
                          {t(`configsPage.calligraphyDialog.fields.${field}`)}
                        </Label>
                        <Input
                          id={`calligraphy-${index}-${field}`}
                          type='number'
                          min={0}
                          step={field === 'extra_price' ? 1000 : 1}
                          value={String(rule[field])}
                          onChange={(event) => setRuleField(index, field, event.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => removeRule(index)}
                    >
                      <Trash2 className='size-4' />
                      <span className='sr-only'>{t('configsPage.calligraphyDialog.removeRule')}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {issue ? (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2'>
              <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-destructive' />
              <p className='text-xs text-destructive'>{t(`configsPage.calligraphyDialog.errors.${issue.code}`)}</p>
            </div>
          ) : null}

          {isCoverageShort ? (
            <div className='flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2'>
              <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
              <p className='text-xs text-amber-800'>
                {t('configsPage.calligraphyDialog.coverageWarning', {
                  covered: coveredMaxWords,
                  required: maxWordsAcrossSizes
                })}
              </p>
            </div>
          ) : null}

          {/* <div className='rounded-xl border bg-muted/30 p-4'>
            <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
              {t('configsPage.calligraphyDialog.previewTitle')}
            </p>
            <div className='mt-2 flex items-center gap-3'>
              <Input
                type='number'
                min={0}
                className='w-28'
                value={previewWords}
                onChange={(event) => setPreviewWords(event.target.value)}
              />
              <p className='text-sm'>
                {previewExtraPrice === null
                  ? t('configsPage.calligraphyDialog.previewNoMatch')
                  : t('configsPage.calligraphyDialog.previewResult', {
                      price: formatCurrency(previewExtraPrice)
                    })}
              </p>
            </div>
          </div> */}
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
