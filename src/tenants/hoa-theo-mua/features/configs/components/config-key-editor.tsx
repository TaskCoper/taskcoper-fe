import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CopyIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { type ReactNode, useId } from 'react'
import { buildPayload, syntaxHighlight } from '../config-utils'
import type {
  ConfigInputType,
  ConfigOption,
  ConfigRecord,
  ConfigRecordValue,
  ConfigSwitch,
  ConfigValidationRule
} from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────

const INPUT_TYPES: ConfigInputType[] = [
  'text',
  'number',
  'currency',
  'percentage',
  'select',
  'address',
  'checkbox',
  'switch-group',
  'date',
  'dateRange'
]

const VALIDATIONS_BY_TYPE: Record<ConfigInputType, string[]> = {
  text: ['minLength', 'maxLength', 'pattern'],
  number: ['min', 'max', 'step'],
  currency: ['min', 'max', 'currency'],
  percentage: ['min', 'max'],
  select: ['multiple'],
  address: [],
  checkbox: [],
  'switch-group': [],
  date: ['minDate', 'maxDate'],
  dateRange: ['minDate', 'maxDate', 'minDays', 'maxDays']
}

const DEFAULT_VALUES: Record<ConfigInputType, unknown> = {
  text: '',
  number: 0,
  currency: 0,
  percentage: 0,
  select: '',
  address: { street: '', city: '', state: '', zip: '', country: '' },
  checkbox: false,
  'switch-group': {},
  date: '',
  dateRange: { from: '', to: '' }
}

const TYPE_BADGE_CLASSES: Record<ConfigInputType, string> = {
  text: 'bg-blue-100 text-blue-700',
  number: 'bg-orange-100 text-orange-700',
  currency: 'bg-orange-100 text-orange-700',
  percentage: 'bg-orange-100 text-orange-700',
  select: 'bg-blue-100 text-blue-700',
  address: 'bg-purple-100 text-purple-700',
  checkbox: 'bg-green-100 text-green-700',
  'switch-group': 'bg-purple-100 text-purple-700',
  date: 'bg-amber-100 text-amber-700',
  dateRange: 'bg-amber-100 text-amber-700'
}

const CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'GBP']

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-widest uppercase', className)}>
      {children}
    </div>
  )
}

// ─── Value editor (per inputType) ────────────────────────────────────────────

interface ValueEditorProps {
  type: ConfigInputType
  value: unknown
  options: ConfigOption[]
  switches: ConfigSwitch[]
  onChange: (value: unknown) => void
}

function ValueEditor({ type, value, options, switches, onChange }: ValueEditorProps) {
  const { t } = useTenantTranslation()

  switch (type) {
    case 'text':
      return (
        <Input value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className='font-mono text-sm' />
      )

    case 'number':
      return (
        <Input
          type='number'
          value={String(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className='w-48'
        />
      )

    case 'currency':
      return (
        <Input
          type='number'
          value={String(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className='w-48'
        />
      )

    case 'percentage':
      return (
        <div className='flex items-center gap-2'>
          <Input
            type='number'
            min={0}
            max={100}
            value={String(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className='w-32'
          />
          <span className='text-muted-foreground text-sm font-medium'>%</span>
        </div>
      )

    case 'select': {
      if (!options || options.length === 0) {
        return <p className='text-muted-foreground text-sm italic'>{t('configKeys.editor.addOption')}</p>
      }
      return (
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className='w-64'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    case 'address': {
      const addr = (value as Record<string, string>) ?? {}
      const update = (field: string, v: string) => onChange({ ...addr, [field]: v })
      return (
        <div className='grid gap-2'>
          <Input placeholder='Street' value={addr.street ?? ''} onChange={(e) => update('street', e.target.value)} />
          <div className='grid grid-cols-2 gap-2'>
            <Input placeholder='City' value={addr.city ?? ''} onChange={(e) => update('city', e.target.value)} />
            <Input placeholder='State' value={addr.state ?? ''} onChange={(e) => update('state', e.target.value)} />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Input placeholder='ZIP' value={addr.zip ?? ''} onChange={(e) => update('zip', e.target.value)} />
            <Input
              placeholder='Country'
              value={addr.country ?? ''}
              onChange={(e) => update('country', e.target.value)}
            />
          </div>
        </div>
      )
    }

    case 'checkbox': {
      const checked = Boolean(value)
      return (
        <div className='flex items-center gap-3'>
          <Switch checked={checked} onCheckedChange={onChange} />
          <span className='text-sm'>
            {checked ? t('configKeys.editor.enabledByDefault') : t('configKeys.editor.disabledByDefault')}
          </span>
        </div>
      )
    }

    case 'switch-group': {
      const map = (value as Record<string, boolean>) ?? {}
      if (!switches || switches.length === 0) {
        return <p className='text-muted-foreground text-sm italic'>{t('configKeys.editor.addSwitch')}</p>
      }
      return (
        <div className='space-y-2'>
          {switches.map((sw) => (
            <div key={sw.key} className='flex items-center justify-between rounded-lg border px-3 py-2'>
              <span className='text-sm'>{sw.label || sw.key}</span>
              <Switch checked={map[sw.key] ?? false} onCheckedChange={(v) => onChange({ ...map, [sw.key]: v })} />
            </div>
          ))}
        </div>
      )
    }

    case 'date':
      return (
        <Input type='date' value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className='w-48' />
      )

    case 'dateRange': {
      const range = (value as { from?: string; to?: string }) ?? {}
      return (
        <div className='flex items-center gap-3'>
          <div>
            <p className='text-muted-foreground mb-1 text-[10px] uppercase tracking-wider'>
              {t('configKeys.editor.from')}
            </p>
            <Input
              type='date'
              value={range.from ?? ''}
              onChange={(e) => onChange({ ...range, from: e.target.value })}
              className='w-44'
            />
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-[10px] uppercase tracking-wider'>
              {t('configKeys.editor.to')}
            </p>
            <Input
              type='date'
              value={range.to ?? ''}
              onChange={(e) => onChange({ ...range, to: e.target.value })}
              className='w-44'
            />
          </div>
        </div>
      )
    }

    default:
      return null
  }
}

// ─── Extras editor (options / switches) ──────────────────────────────────────

interface ExtrasEditorProps {
  type: ConfigInputType
  options: ConfigOption[]
  switches: ConfigSwitch[]
  onOptionsChange: (options: ConfigOption[]) => void
  onSwitchesChange: (switches: ConfigSwitch[]) => void
}

function ExtrasEditor({ type, options, switches, onOptionsChange, onSwitchesChange }: ExtrasEditorProps) {
  const { t } = useTenantTranslation()

  if (type === 'select') {
    return (
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <SectionLabel>{t('configKeys.editor.options')}</SectionLabel>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-6 gap-1 px-2 text-xs'
            onClick={() => onOptionsChange([...options, { label: '', value: '' }])}
          >
            <PlusIcon className='size-3' />
            {t('configKeys.editor.addOption')}
          </Button>
        </div>
        <div className='space-y-2'>
          {options.map((opt, i) => (
            <div key={i} className='flex items-center gap-2'>
              <Input
                placeholder={t('configKeys.editor.optionLabelPlaceholder')}
                value={opt.label}
                onChange={(e) => {
                  const next = [...options]
                  next[i] = { ...next[i], label: e.target.value }
                  onOptionsChange(next)
                }}
              />
              <Input
                placeholder={t('configKeys.editor.optionValuePlaceholder')}
                value={opt.value}
                onChange={(e) => {
                  const next = [...options]
                  next[i] = { ...next[i], value: e.target.value }
                  onOptionsChange(next)
                }}
                className='font-mono'
              />
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-8 shrink-0 text-destructive hover:text-destructive'
                onClick={() => onOptionsChange(options.filter((_, j) => j !== i))}
              >
                <XIcon className='size-3.5' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'switch-group') {
    return (
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <SectionLabel>{t('configKeys.editor.switches')}</SectionLabel>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-6 gap-1 px-2 text-xs'
            onClick={() => onSwitchesChange([...switches, { key: '', label: '' }])}
          >
            <PlusIcon className='size-3' />
            {t('configKeys.editor.addSwitch')}
          </Button>
        </div>
        <div className='space-y-2'>
          {switches.map((sw, i) => (
            <div key={i} className='flex items-center gap-2'>
              <Input
                placeholder={t('configKeys.editor.switchKeyPlaceholder')}
                value={sw.key}
                onChange={(e) => {
                  const next = [...switches]
                  next[i] = { ...next[i], key: e.target.value }
                  onSwitchesChange(next)
                }}
                className='font-mono'
              />
              <Input
                placeholder={t('configKeys.editor.switchLabelPlaceholder')}
                value={sw.label}
                onChange={(e) => {
                  const next = [...switches]
                  next[i] = { ...next[i], label: e.target.value }
                  onSwitchesChange(next)
                }}
              />
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-8 shrink-0 text-destructive hover:text-destructive'
                onClick={() => onSwitchesChange(switches.filter((_, j) => j !== i))}
              >
                <XIcon className='size-3.5' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// ─── Validations editor ───────────────────────────────────────────────────────

interface ValidationsEditorProps {
  type: ConfigInputType
  validations: ConfigValidationRule[]
  onChange: (validations: ConfigValidationRule[]) => void
}

function getValidationInputType(rule: string): 'number' | 'date' | 'text' | 'select-bool' | 'select-currency' {
  if (['minLength', 'maxLength', 'min', 'max', 'step', 'minDays', 'maxDays'].includes(rule)) return 'number'
  if (['minDate', 'maxDate'].includes(rule)) return 'date'
  if (rule === 'currency') return 'select-currency'
  if (rule === 'multiple') return 'select-bool'
  return 'text'
}

function ValidationsEditor({ type, validations, onChange }: ValidationsEditorProps) {
  const { t } = useTenantTranslation()
  const availableRules = VALIDATIONS_BY_TYPE[type] ?? []
  const usedRules = validations.map((v) => Object.keys(v)[0])
  const unusedRules = availableRules.filter((r) => !usedRules.includes(r))

  const updateRule = (index: number, value: string | number | boolean) => {
    const next = [...validations]
    const key = Object.keys(next[index])[0]
    next[index] = { [key]: value }
    onChange(next)
  }

  const removeRule = (index: number) => {
    onChange(validations.filter((_, i) => i !== index))
  }

  const addRule = (rule: string) => {
    const inputType = getValidationInputType(rule)
    const defaultVal: string | number | boolean = inputType === 'number' ? 0 : inputType === 'select-bool' ? false : ''
    onChange([...validations, { [rule]: defaultVal }])
  }

  if (availableRules.length === 0) return null

  return (
    <div>
      <SectionLabel>{t('configKeys.editor.validations')}</SectionLabel>

      {validations.length > 0 && (
        <div className='mb-2 space-y-2'>
          {validations.map((rule, i) => {
            const key = Object.keys(rule)[0]
            const val = rule[key]
            const inputType = getValidationInputType(key)
            const label = t(`configKeys.validationRules.${key}`, { defaultValue: key })

            return (
              <div key={i} className='flex items-center gap-2'>
                <span className='w-32 shrink-0 text-xs font-medium'>{label}</span>
                {inputType === 'number' && (
                  <Input
                    type='number'
                    value={String(val)}
                    onChange={(e) => updateRule(i, Number(e.target.value))}
                    className='w-32'
                  />
                )}
                {inputType === 'date' && (
                  <Input
                    type='date'
                    value={String(val)}
                    onChange={(e) => updateRule(i, e.target.value)}
                    className='w-44'
                  />
                )}
                {inputType === 'text' && (
                  <Input value={String(val)} onChange={(e) => updateRule(i, e.target.value)} className='font-mono' />
                )}
                {inputType === 'select-currency' && (
                  <Select value={String(val)} onValueChange={(v) => updateRule(i, v)}>
                    <SelectTrigger className='w-28'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {inputType === 'select-bool' && (
                  <Select value={String(val)} onValueChange={(v) => updateRule(i, v === 'true')}>
                    <SelectTrigger className='w-28'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='true'>{t('configKeys.editor.boolTrue')}</SelectItem>
                      <SelectItem value='false'>{t('configKeys.editor.boolFalse')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  className='size-8 shrink-0 text-destructive hover:text-destructive'
                  onClick={() => removeRule(i)}
                >
                  <XIcon className='size-3.5' />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {unusedRules.length > 0 && (
        <Select onValueChange={addRule} value=''>
          <SelectTrigger className='w-52 text-xs'>
            <SelectValue placeholder={t('configKeys.editor.addValidation')} />
          </SelectTrigger>
          <SelectContent>
            {unusedRules.map((r) => (
              <SelectItem key={r} value={r} className='text-xs'>
                {t(`configKeys.validationRules.${r}`, { defaultValue: r })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

// ─── JSON Preview ─────────────────────────────────────────────────────────────

function JsonPreview({ draft }: { draft: ConfigRecord }) {
  const payload = buildPayload(draft)
  const json = JSON.stringify(payload, null, 2)
  return (
    <pre
      className='overflow-auto rounded-lg p-4 text-[12px] leading-relaxed'
      style={{ background: '#1e1e1e', fontFamily: 'ui-monospace, monospace' }}
      // biome-ignore lint: safe — content is serialized from our own state, no XSS risk
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
    />
  )
}

// ─── Main editor component ────────────────────────────────────────────────────

export interface ConfigKeyEditorProps {
  draft: ConfigRecord
  allGroups: string[]
  onChange: (draft: ConfigRecord) => void
  onSave: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCancel: () => void
  onCopyJson?: () => void
  isSaving: boolean
}

export default function ConfigKeyEditor({
  draft,
  allGroups,
  onChange,
  onSave,
  onDelete,
  onDuplicate,
  onCancel,
  onCopyJson,
  isSaving
}: ConfigKeyEditorProps) {
  const { t } = useTenantTranslation()
  const groupListId = useId()

  const { key, userId, value: draftValue } = draft
  const { group, label, description, inputType, value, required, active, validations, options, switches } = draftValue

  const update = (patch: Partial<ConfigRecordValue>) => onChange({ ...draft, value: { ...draftValue, ...patch } })

  const handleInputTypeChange = (newType: ConfigInputType) => {
    onChange({
      ...draft,
      value: {
        ...draftValue,
        inputType: newType,
        value: DEFAULT_VALUES[newType],
        validations: [],
        options: newType === 'select' ? (options?.length ? options : [{ label: '', value: '' }]) : undefined,
        switches: newType === 'switch-group' ? (switches?.length ? switches : [{ key: '', label: '' }]) : undefined
      }
    })
  }

  const showExtras = inputType === 'select' || inputType === 'switch-group'

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex shrink-0 items-start justify-between gap-4 border-b px-6 py-4'>
        <div className='min-w-0'>
          <p className='truncate font-mono text-lg font-semibold'>{key || '—'}</p>
          <p className='text-muted-foreground mt-0.5 truncate text-sm'>{label || '—'}</p>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <span
            className={cn('rounded-full px-2 py-0.5 font-mono text-[10px] font-medium', TYPE_BADGE_CLASSES[inputType])}
          >
            {inputType}
          </span>
          <Button type='button' size='icon' variant='ghost' className='size-8' onClick={onDuplicate}>
            <CopyIcon className='size-4' />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            className='size-8 text-destructive hover:text-destructive'
            onClick={onDelete}
          >
            <Trash2Icon className='size-4' />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-y-auto px-6 py-5'>
        <div className='space-y-6'>
          {/* Meta chips */}
          {!draft._isNew && (
            <div className='flex flex-wrap gap-2'>
              <span className='bg-muted rounded-md px-2 py-1 font-mono text-[11px]'>
                <span className='text-muted-foreground'>{t('configKeys.editor.metaId')}</span>
                {draft.id.slice(0, 8)}…
              </span>
              {userId && (
                <span className='bg-muted rounded-md px-2 py-1 font-mono text-[11px]'>
                  <span className='text-muted-foreground'>{t('configKeys.editor.metaUserId')}</span>
                  {userId.slice(0, 8)}…
                </span>
              )}
            </div>
          )}

          {/* Key */}
          <div>
            <SectionLabel>{t('configKeys.editor.key')}</SectionLabel>
            <Input
              value={key}
              onChange={(e) => onChange({ ...draft, key: e.target.value })}
              className='font-mono'
              placeholder={t('configKeys.editor.keyPlaceholder')}
            />
          </div>

          {/* Group + InputType */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <SectionLabel>{t('configKeys.editor.group')}</SectionLabel>
              <Input
                list={groupListId}
                value={group}
                onChange={(e) => update({ group: e.target.value })}
                placeholder='general'
              />
              <datalist id={groupListId}>
                {allGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
            <div>
              <SectionLabel>{t('configKeys.editor.inputType')}</SectionLabel>
              <Select value={inputType} onValueChange={(v) => handleInputTypeChange(v as ConfigInputType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map((it) => (
                    <SelectItem key={it} value={it} className='font-mono text-sm'>
                      {it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Label */}
          <div>
            <SectionLabel>{t('configKeys.editor.label')}</SectionLabel>
            <Input
              value={label}
              onChange={(e) => update({ label: e.target.value })}
              placeholder={t('configKeys.editor.labelPlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <SectionLabel>{t('configKeys.editor.description')}</SectionLabel>
            <Textarea
              value={description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder={t('configKeys.editor.descriptionPlaceholder')}
              rows={2}
              className='resize-none'
            />
          </div>

          {/* Extras (options / switches) */}
          {showExtras && (
            <ExtrasEditor
              type={inputType}
              options={options ?? []}
              switches={switches ?? []}
              onOptionsChange={(opts) => update({ options: opts })}
              onSwitchesChange={(sws) => update({ switches: sws })}
            />
          )}

          {/* Default value */}
          <div>
            <SectionLabel>{t('configKeys.editor.defaultValue')}</SectionLabel>
            <ValueEditor
              type={inputType}
              value={value}
              options={options ?? []}
              switches={switches ?? []}
              onChange={(v) => update({ value: v })}
            />
          </div>

          {/* Required */}
          <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>{t('configKeys.editor.required')}</p>
              <p className='text-muted-foreground text-xs'>{t('configKeys.editor.requiredDesc')}</p>
            </div>
            <Switch checked={required === true} onCheckedChange={(v) => update({ required: v || undefined })} />
          </div>

          {/* Validations */}
          <ValidationsEditor
            type={inputType}
            validations={validations ?? []}
            onChange={(v) => update({ validations: v })}
          />

          {/* Active */}
          <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>{t('configKeys.editor.active')}</p>
              <p className='text-muted-foreground text-xs'>{t('configKeys.editor.activeDesc')}</p>
            </div>
            <Switch checked={active !== false} onCheckedChange={(v) => update({ active: v ? undefined : false })} />
          </div>

          {/* JSON preview */}
          <div>
            <SectionLabel>{t('configKeys.editor.jsonPreview')}</SectionLabel>
            <JsonPreview draft={draft} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex shrink-0 items-center justify-between border-t px-6 py-3'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          {t('configKeys.editor.cancel')}
        </Button>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={onCopyJson}>
            <CopyIcon className='mr-1.5 size-3.5' />
            {t('configKeys.editor.copyJson')}
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={onSave}
            disabled={isSaving}
            className='bg-indigo-600 text-white hover:bg-indigo-700'
          >
            {isSaving ? t('configKeys.editor.saving') : t('configKeys.editor.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
