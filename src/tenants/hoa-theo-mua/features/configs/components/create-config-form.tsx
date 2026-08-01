import { DatePickerField } from '@/components/date-picker-field'
import MultiSelectField from '@/components/multi-select-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { FileIcon, Plus, Trash2, UploadIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { ConfigKind, ConfigKindLabel, InputType, InputTypeLabel, type InputOption, type ValidationRule } from '../types'
import type { CreateConfigFormInput, CreateConfigFormValues } from '../validations'
import { isSecondsAsMinutesConfigKey } from '../duration-config-keys'
import DurationMinutesInput from './duration-minutes-input'

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'])

const getUrlExtension = (url: string): string => {
  const path = url.split('?')[0].split('#')[0]
  const last = path.split('/').pop() ?? ''
  const dot = last.lastIndexOf('.')
  return dot >= 0 ? last.slice(dot + 1).toLowerCase() : ''
}

const isImageLike = (url: string, mime?: string): boolean =>
  (mime?.startsWith('image/') ?? false) || IMAGE_EXTENSIONS.has(getUrlExtension(url))

const getDisplayName = (url: string, fallback?: string): string => {
  if (fallback) return fallback
  const path = url.split('?')[0].split('#')[0]
  return decodeURIComponent(path.split('/').pop() ?? url)
}

const RULE_KEYS = ['minLength', 'maxLength', 'min', 'max', 'pattern', 'email', 'url', 'integer'] as const
type RuleKey = (typeof RULE_KEYS)[number]

const BOOLEAN_RULES: RuleKey[] = ['email', 'url', 'integer']

const AVAILABLE_VALIDATIONS: Partial<Record<InputType, RuleKey[]>> = {
  [InputType.text]: ['minLength', 'maxLength', 'pattern', 'email', 'url'],
  [InputType.textarea]: ['minLength', 'maxLength', 'pattern'],
  [InputType.number]: ['min', 'max', 'integer'],
  [InputType.image]: ['url'],
  [InputType.file]: ['url']
}

const getRuleKey = (item: Record<string, unknown>): RuleKey | undefined => RULE_KEYS.find((k) => k in item)

const getGroupFromKey = (key: string): string => key.split('.')[0] ?? ''

export interface CreateConfigFormProps {
  lockedFields?: { key?: boolean; options?: boolean; kind?: boolean }
  onPendingFileChange?: (file: File | null) => void
}

export default function CreateConfigForm({ lockedFields, onPendingFileChange }: CreateConfigFormProps = {}) {
  const { t } = useTenantTranslation()
  const lockKey = !!lockedFields?.key
  const lockOptions = !!lockedFields?.options
  const lockKind = !!lockedFields?.kind
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFileMeta, setPendingFileMeta] = useState<{ previewUrl: string; name: string; mime: string } | null>(
    null
  )

  useEffect(() => {
    return () => {
      if (pendingFileMeta?.previewUrl) URL.revokeObjectURL(pendingFileMeta.previewUrl)
    }
  }, [pendingFileMeta?.previewUrl])

  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<CreateConfigFormInput, unknown, CreateConfigFormValues>()

  const inputType = (watch('value.inputType') ?? InputType.text) as InputType
  const availableRules = AVAILABLE_VALIDATIONS[inputType] ?? []
  const isDurationInSeconds = isSecondsAsMinutesConfigKey(watch('key'))

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: 'value.options'
  })

  const {
    fields: validationFields,
    append: appendValidation,
    remove: removeValidation
  } = useFieldArray({
    control,
    name: 'value.validations'
  })

  const watchedValidations = (watch('value.validations') ?? []) as Array<Record<string, unknown>>
  const watchedOptions = (watch('value.options') ?? []) as InputOption[]

  const getDefaultValueForType = (type: InputType): unknown => {
    switch (type) {
      case InputType.multiSelect:
        return []
      case InputType.boolean:
      case InputType.switch:
        return false
      default:
        return undefined
    }
  }

  const handleInputTypeChange = (newType: string) => {
    const nextType = newType as InputType
    const opts = { shouldDirty: true, shouldValidate: true } as const

    setValue('value.inputType', nextType, opts)
    setValue('value.value', getDefaultValueForType(nextType), opts)
    setValue('value.validations', [], opts)
    if (nextType !== InputType.select && nextType !== InputType.multiSelect) {
      setValue('value.options', [], opts)
    }
  }

  const handleRemoveOption = (index: number) => {
    const removed = watchedOptions[index]
    removeOption(index)
    const currentDefault = watch('value.value')
    if (removed !== undefined && currentDefault != null && String(currentDefault) === String(removed.value)) {
      setValue('value.value', undefined)
    }
  }

  const addValidationRule = (ruleKey: RuleKey) => {
    const initial: Record<RuleKey, ValidationRule> = {
      minLength: { minLength: 0 },
      maxLength: { maxLength: 100 },
      min: { min: 0 },
      max: { max: 100 },
      pattern: { pattern: '' },
      email: { email: true as const },
      url: { url: true as const },
      integer: { integer: true as const }
    }
    appendValidation(initial[ruleKey])
  }

  const defaultValueNode = (() => {
    switch (inputType) {
      case InputType.boolean:
      case InputType.switch:
        return (
          <Controller
            name='value.value'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Switch id='default-value' checked={!!field.value} onCheckedChange={field.onChange} />
                <label htmlFor='default-value' className='cursor-pointer select-none text-sm'>
                  {field.value ? 'true' : 'false'}
                </label>
              </div>
            )}
          />
        )
      case InputType.number:
        if (isDurationInSeconds) {
          return (
            <Controller
              name='value.value'
              control={control}
              render={({ field }) => (
                <div className='flex items-center gap-2'>
                  <DurationMinutesInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder='0'
                  />
                  <span className='shrink-0 text-xs text-muted-foreground'>{t('configsPage.dialog.minutesUnit')}</span>
                </div>
              )}
            />
          )
        }
        return <Input type='number' {...register('value.value', { valueAsNumber: true })} placeholder='0' />
      case InputType.date:
        return (
          <DatePickerField
            control={control}
            name='value.value'
            label={'configsPage.dialog.defaultValueField' as I18nKey}
            placeholder={'configsPage.dialog.selectDefaultPlaceholder' as I18nKey}
            isRequired={false}
          />
        )
      case InputType.textarea:
      case InputType.text:
        return <Textarea rows={3} {...register('value.value')} />
      case InputType.json:
      case InputType.address:
        return <Textarea rows={4} placeholder='{}' {...register('value.value')} />
      case InputType.select:
      case InputType.multiSelect:
        return null
      case InputType.file:
        return (
          <Controller
            name='value.value'
            control={control}
            render={({ field, fieldState }) => {
              const stored = field.value ? String(field.value) : ''
              const hasPending = !!pendingFileMeta
              const previewSrc = hasPending ? pendingFileMeta!.previewUrl : stored
              const displayName = hasPending ? pendingFileMeta!.name : stored ? getDisplayName(stored) : ''
              const isImage = hasPending
                ? isImageLike(pendingFileMeta!.previewUrl, pendingFileMeta!.mime)
                : stored
                  ? isImageLike(stored)
                  : false

              return (
                <div className='space-y-3'>
                  {previewSrc ? (
                    isImage ? (
                      <div className='w-full h-auto shrink-0 overflow-hidden rounded-2xl shadow border border-border'>
                        <img src={previewSrc} alt='' className='size-full object-cover' />
                      </div>
                    ) : (
                      <div className='flex items-center gap-1'>
                        <Card className='flex-1 flex-row items-center gap-1.5 p-2 rounded-lg' title={displayName}>
                          <FileIcon className='size-3.5 shrink-0' />
                          <span className='max-w-40 truncate text-sm'>{displayName}</span>
                        </Card>

                        {(previewSrc || hasPending) && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-9 shrink-0 text-muted-foreground hover:text-destructive'
                            onClick={() => {
                              if (pendingFileMeta?.previewUrl) URL.revokeObjectURL(pendingFileMeta.previewUrl)
                              setPendingFileMeta(null)
                              onPendingFileChange?.(null)
                              field.onChange(undefined)
                            }}
                          >
                            <Trash2 className='size-3.5' />
                          </Button>
                        )}
                      </div>
                    )
                  ) : null}

                  <div className='flex items-center gap-2'>
                    <input
                      type='file'
                      className='hidden'
                      ref={fileInputRef}
                      onChange={(e) => {
                        const picked = e.target.files?.[0]
                        e.target.value = ''
                        if (!picked) return
                        if (pendingFileMeta?.previewUrl) URL.revokeObjectURL(pendingFileMeta.previewUrl)
                        const previewUrl = URL.createObjectURL(picked)
                        setPendingFileMeta({ previewUrl, name: picked.name, mime: picked.type })
                        onPendingFileChange?.(picked)
                        // Set a non-empty marker so `required` validation passes; the dialog
                        // replaces it with the uploaded URL on submit.
                        field.onChange(previewUrl)
                      }}
                    />

                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className={cn('flex-1 text-xs', fieldState.invalid && 'border-destructive')}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon data-icon='inline-start' />
                      {previewSrc ? t('configsPage.dialog.replaceFile') : t('configsPage.dialog.chooseFile')}
                    </Button>
                  </div>
                </div>
              )
            }}
          />
        )
      default:
        return <Input {...register('value.value')} />
    }
  })()

  return (
    <div className='space-y-2'>
      {/* Key + Group */}
      <div className='grid grid-cols-2 gap-3'>
        <Controller
          name='key'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor='cfg-key'>
                {t('configsPage.dialog.keyField')}
                <span className='font-semibold text-destructive'>*</span>
              </FieldLabel>
              <Input
                {...field}
                id='cfg-key'
                placeholder={t('configsPage.dialog.keyPlaceholder')}
                aria-invalid={fieldState.invalid}
                disabled={lockKey}
                onChange={(e) => {
                  if (lockKey) return
                  field.onChange(e)
                  const group = getGroupFromKey(e.target.value)
                  setValue('group', group)
                  setValue('value.group', group)
                }}
              />
              <div className='min-h-4'>
                {lockKey ? (
                  <span className='text-xs text-muted-foreground'>{t('configsPage.dialog.keyLockedHint')}</span>
                ) : (
                  fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />
                )}
              </div>
            </Field>
          )}
        />

        <Controller
          name='value.group'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor='cfg-group'>
                {t('configsPage.dialog.groupField')}
                <span className='font-semibold text-destructive'>*</span>
              </FieldLabel>
              <Input {...field} id='cfg-group' aria-invalid={fieldState.invalid} disabled />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      {/* Label */}
      <Controller
        name='value.label'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor='cfg-label'>
              {t('configsPage.dialog.labelField')}
              <span className='font-semibold text-destructive'>*</span>
            </FieldLabel>
            <Input
              {...field}
              id='cfg-label'
              placeholder={t('configsPage.dialog.labelPlaceholder')}
              aria-invalid={fieldState.invalid}
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      {/* Kind */}
      <Controller
        name='kind'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor='cfg-kind'>
              {t('configsPage.dialog.kindField')}
              <span className='font-semibold text-destructive'>*</span>
            </FieldLabel>
            <Select value={field.value} onValueChange={(v) => field.onChange(v as ConfigKind)} disabled={lockKind}>
              <SelectTrigger id='cfg-kind' aria-invalid={fieldState.invalid} disabled={lockKind}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ConfigKind).map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {t(ConfigKindLabel[kind] as I18nKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='min-h-4'>
              {lockKind ? (
                <span className='text-xs text-muted-foreground'>{t('configsPage.dialog.kindLockedHint')}</span>
              ) : (
                fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />
              )}
            </div>
          </Field>
        )}
      />

      {/* Input Type + Required */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        <Controller
          name='value.inputType'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel>{t('configsPage.dialog.inputTypeField')}</FieldLabel>
              <Select value={field.value} onValueChange={handleInputTypeChange}>
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(InputType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {InputTypeLabel[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name='value.required'
          control={control}
          render={({ field }) => (
            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.dialog.requiredField')}</FieldLabel>
              <div className='flex h-9 items-center gap-2'>
                <Checkbox id='cfg-required' checked={field.value} onCheckedChange={field.onChange} />
                <label htmlFor='cfg-required' className='cursor-pointer select-none text-sm text-muted-foreground'>
                  {t('configsPage.dialog.requiredDesc')}
                </label>
              </div>
            </Field>
          )}
        />
      </div>

      {/* Default Value */}
      {defaultValueNode &&
        (inputType === InputType.date ? (
          defaultValueNode
        ) : (
          <FieldGroup className='gap-1'>
            <FieldLabel>{t('configsPage.dialog.defaultValueField')}</FieldLabel>
            {defaultValueNode}
            {errors.value?.value && <FieldError className='text-xs' errors={[errors.value.value as never]} />}
          </FieldGroup>
        ))}

      {/* Description */}
      <Controller
        name='value.description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 mt-4'>
            <FieldLabel htmlFor='cfg-desc'>{t('configsPage.dialog.descriptionField')}</FieldLabel>
            <Textarea
              {...field}
              id='cfg-desc'
              className='resize-none min-h-32'
              placeholder={t('configsPage.dialog.descriptionPlaceholder')}
              aria-invalid={fieldState.invalid}
              rows={2}
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      {/* Options — select & multiSelect share the editor (hidden when sourced from an async API) */}
      {(inputType === InputType.select || inputType === InputType.multiSelect) && !lockOptions && (
        <FieldGroup className='gap-2'>
          <div className='flex items-center justify-between'>
            <FieldLabel className='font-semibold'>{t('configsPage.dialog.optionsSection')}</FieldLabel>
            <Button type='button' variant='ghost' size='sm' onClick={() => appendOption({ label: '', value: '' })}>
              <Plus className='size-3.5' />
              {t('configsPage.dialog.addOption')}
            </Button>
          </div>
          {optionFields.map((optField, index) => (
            <div key={optField.id} className='flex items-center gap-2'>
              <Input
                {...register(`value.options.${index}.label`)}
                placeholder={t('configsPage.dialog.optionLabelPlaceholder')}
                className='flex-1'
              />
              <Input
                {...register(`value.options.${index}.value`)}
                placeholder={t('configsPage.dialog.optionValuePlaceholder')}
                className='flex-1'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-9 shrink-0 text-muted-foreground hover:text-destructive'
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className='size-3.5' />
              </Button>
            </div>
          ))}
        </FieldGroup>
      )}

      {(inputType === InputType.select || inputType === InputType.multiSelect) && lockOptions && (
        <FieldGroup className='gap-1 mb-4'>
          <FieldLabel className='font-semibold'>{t('configsPage.dialog.optionsSection')}</FieldLabel>
          <p className='text-xs text-muted-foreground'>
            {t('configsPage.dialog.optionsLockedHint', { count: watchedOptions.length })}
          </p>
        </FieldGroup>
      )}

      {/* Default Value — select (single value) */}
      {inputType === InputType.select && (
        <FieldGroup className='gap-1'>
          <FieldLabel>{t('configsPage.dialog.defaultValueField')}</FieldLabel>
          <Controller
            name='value.value'
            control={control}
            render={({ field }) => {
              const validOptions = watchedOptions.filter(
                (opt) => opt.value !== undefined && opt.value !== null && String(opt.value).length > 0
              )
              const currentValue = field.value != null && field.value !== '' ? String(field.value) : ''

              return (
                <div className='flex items-center gap-2'>
                  <Select
                    value={currentValue}
                    onValueChange={(val) => {
                      const matched = validOptions.find((o) => String(o.value) === val)
                      field.onChange(matched?.value ?? val)
                    }}
                    disabled={validOptions.length === 0}
                  >
                    <SelectTrigger className='flex-1'>
                      <SelectValue placeholder={t('configsPage.dialog.selectDefaultPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {validOptions.map((opt, i) => (
                        <SelectItem key={`${i}-${String(opt.value)}`} value={String(opt.value)}>
                          {opt.label || String(opt.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {currentValue && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-9 shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => field.onChange(undefined)}
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  )}
                </div>
              )
            }}
          />
          {errors.value?.value && <FieldError className='text-xs' errors={[errors.value.value as never]} />}
        </FieldGroup>
      )}

      {/* Default Values — multiSelect (array) */}
      {inputType === InputType.multiSelect && (
        <FieldGroup className='gap-1'>
          <FieldLabel>{t('configsPage.dialog.defaultValuesField')}</FieldLabel>
          <Controller
            name='value.value'
            control={control}
            render={({ field }) => {
              const validOptions = watchedOptions.filter(
                (opt) => opt.value !== undefined && opt.value !== null && String(opt.value).length > 0
              )
              const stringOptions = validOptions.map((o) => ({
                label: o.label || String(o.value),
                value: String(o.value)
              }))
              const valueMap = new Map(validOptions.map((o) => [String(o.value), o.value]))
              const arr = (Array.isArray(field.value) ? field.value : []) as (string | number)[]

              return (
                <div className='flex items-center gap-2'>
                  <div className='flex-1'>
                    <MultiSelectField<CreateConfigFormInput>
                      name='value.value'
                      options={stringOptions}
                      value={arr.map(String)}
                      onValueChange={(next) => field.onChange(next.map((s) => valueMap.get(s) ?? s))}
                      placeholder={'configsPage.dialog.selectDefaultsPlaceholder' as I18nKey}
                      displayError={false}
                      modal
                    />
                  </div>
                  {arr.length > 0 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-9 shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => field.onChange([])}
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  )}
                </div>
              )
            }}
          />
          {errors.value?.value && <FieldError className='text-xs' errors={[errors.value.value as never]} />}
        </FieldGroup>
      )}

      {/* Validations */}
      {availableRules.length > 0 && (
        <FieldGroup className='gap-2'>
          <div className='flex items-center justify-between'>
            <FieldLabel className='font-semibold'>{t('configsPage.dialog.validationsSection')}</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='ghost' size='sm'>
                  <Plus className='size-3.5' />
                  {t('configsPage.dialog.addRule')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {availableRules
                  .filter((rk) => !watchedValidations.some((v) => rk in v))
                  .map((rk) => (
                    <DropdownMenuItem key={rk} onClick={() => addValidationRule(rk)}>
                      {t(`configsPage.dialog.validationRules.${rk}`)}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {validationFields.map((valField, index) => {
            const ruleKey = getRuleKey(watchedValidations[index] ?? {})
            if (!ruleKey) return null
            const isBool = BOOLEAN_RULES.includes(ruleKey)

            return (
              <div key={valField.id} className='flex items-center gap-2'>
                <span className='w-28 shrink-0 text-sm text-muted-foreground'>
                  {t(`configsPage.dialog.validationRules.${ruleKey}`)}
                </span>
                {isBool ? (
                  <span className='flex-1 text-xs text-muted-foreground'>{t('configsPage.dialog.alwaysApplied')}</span>
                ) : (
                  <Input
                    type={ruleKey === 'pattern' ? 'text' : 'number'}
                    className='flex-1'
                    {...register(
                      `value.validations.${index}.${ruleKey}`,
                      ruleKey !== 'pattern' ? { valueAsNumber: true } : undefined
                    )}
                  />
                )}

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 shrink-0 text-muted-foreground hover:text-destructive'
                  onClick={() => removeValidation(index)}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            )
          })}
        </FieldGroup>
      )}
    </div>
  )
}
