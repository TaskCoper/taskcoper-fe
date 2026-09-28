import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CARD_PRICES_KEY,
  defaultCalligraphyRule,
  defaultCalligraphyRules,
  findCalligraphyRulesIssue,
  parseCalligraphyRules,
  sortCalligraphyRules
} from '../../card-config-palette'
import { configKeys } from '../../query-keys'
import { type CalligraphyRule, type Config } from '../../types'
import EditorCallout from '../settings/editor-callout'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'
import { isAmbiguousCardConfigError, saveCardConfigDocument } from './save-card-config'

interface CalligraphyPricingEditorProps {
  /** `null` là tạo mới singleton; ngược lại sửa tại chỗ bản ghi đang có. */
  existingConfig: Config | null
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  onSaved?: () => void
  /** `max_words` lớn nhất trong `card_config.sizes`, dùng để cảnh báo bậc giá chưa phủ hết. */
  maxWordsAcrossSizes?: number
}

type RuleField = keyof CalligraphyRule

const RULE_FIELDS: RuleField[] = ['min_words', 'max_words', 'extra_price']

const snapshot = (label: string, rules: CalligraphyRule[]) => JSON.stringify({ label, rules })

export default function CalligraphyPricingEditor({
  existingConfig,
  onBack,
  onSaved,
  maxWordsAcrossSizes = 0
}: CalligraphyPricingEditorProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [configLabel, setConfigLabel] = useState('')
  const [rules, setRules] = useState<CalligraphyRule[]>(defaultCalligraphyRules)

  const [isSaving, setIsSaving] = useState(false)
  const [baseline, setBaseline] = useState('')

  const fallbackConfigLabel = t('configsPage.calligraphyDialog.configLabelFallback')

  useEffect(() => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const nextRules = existingConfig ? parseCalligraphyRules(existingConfig.value.value) : defaultCalligraphyRules()

    setConfigLabel(label)
    setRules(nextRules)
    setBaseline(snapshot(label, nextRules))
  }, [existingConfig, fallbackConfigLabel])

  // So với snapshot lần lưu gần nhất để shell đăng ký dirty với registry của cả trang.
  const isDirty = snapshot(configLabel, rules) !== baseline

  const revert = () => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const nextRules = existingConfig ? parseCalligraphyRules(existingConfig.value.value) : defaultCalligraphyRules()
    setConfigLabel(label)
    setRules(nextRules)
    setBaseline(snapshot(label, nextRules))
  }

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
      const outcome = await saveCardConfigDocument({
        key: CARD_PRICES_KEY,
        label: configLabel.trim(),
        items: sortedRules,
        existingConfig
      })
      toast.success(t(outcome === 'created' ? 'configKeys.toast.created' : 'configKeys.toast.updated'))

      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      // Đóng bằng `onSaved`, không dùng `onBack` - xem `card-sizes-editor`.
      setBaseline(snapshot(configLabel, rules))
      onSaved?.()
    } catch (error) {
      toast.error(
        isAmbiguousCardConfigError(error)
          ? t('configsPage.calligraphyDialog.errors.ambiguous')
          : t('configKeys.toast.error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <InlineEditorShell
      editorId={CARD_PRICES_KEY}
      title={t('configsPage.calligraphyDialog.title')}
      description={t('configsPage.calligraphyDialog.description')}
      isDirty={isDirty}
      isSaving={isSaving}
      onRevert={revert}
      onSave={save}
      onBack={onBack}
    >
      <EditorCallout>{t('configsPage.calligraphyDialog.hint')}</EditorCallout>

      <EditorSection title={t('configsPage.calligraphyDialog.configLabel')}>
        <Input
          id='calligraphy-config-label'
          aria-label={t('configsPage.calligraphyDialog.configLabel')}
          value={configLabel}
          onChange={(event) => setConfigLabel(event.target.value)}
          placeholder={fallbackConfigLabel}
        />
      </EditorSection>

      <EditorSection
        title={t('configsPage.calligraphyDialog.rulesTitle')}
        description={t('configsPage.calligraphyDialog.rulesSubtitle')}
        action={
          <Button type='button' variant='outline' size='sm' onClick={addRule}>
            <Plus className='size-3.5' />
            {t('configsPage.calligraphyDialog.addRule')}
          </Button>
        }
      >
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
      </EditorSection>

      {issue ? (
        <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2'>
          <TriangleAlert className='mt-0.5 size-3.5 shrink-0 text-destructive' />
          <p className='text-xs text-destructive'>{t(`configsPage.calligraphyDialog.errors.${issue.code}`)}</p>
        </div>
      ) : null}

      {isCoverageShort ? (
        <EditorCallout tone='warning'>
          {t('configsPage.calligraphyDialog.coverageWarning', {
            covered: coveredMaxWords,
            required: maxWordsAcrossSizes
          })}
        </EditorCallout>
      ) : null}
    </InlineEditorShell>
  )
}
