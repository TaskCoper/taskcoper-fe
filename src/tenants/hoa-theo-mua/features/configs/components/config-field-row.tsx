import MultiSelectField from '@/components/multi-select-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlignJustifyIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Code2Icon,
  HashIcon,
  ImageIcon,
  ListChecksIcon,
  MapPinIcon,
  PencilIcon,
  SaveIcon,
  ToggleLeftIcon,
  TypeIcon,
  UploadIcon
} from 'lucide-react'
import { useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import configService from '../services'
import { INPUT_TYPE_COLOR, InputType, type Config, type ConfigDefinition } from '../types'
import { buildValueValidator } from '../validations'

interface ConfigFieldRowProps {
  config: Config
  onEdit: () => void
}

const INPUT_TYPE_ICON: Record<InputType, React.ReactNode> = {
  [InputType.text]: <TypeIcon className='size-3' />,
  [InputType.textarea]: <AlignJustifyIcon className='size-3' />,
  [InputType.number]: <HashIcon className='size-3' />,
  [InputType.boolean]: <CheckCircle2Icon className='size-3' />,
  [InputType.switch]: <ToggleLeftIcon className='size-3' />,
  [InputType.date]: <CalendarIcon className='size-3' />,
  [InputType.select]: <ChevronDownIcon className='size-3' />,
  [InputType.multiSelect]: <ListChecksIcon className='size-3' />,
  [InputType.json]: <Code2Icon className='size-3' />,
  [InputType.image]: <ImageIcon className='size-3' />,
  [InputType.address]: <MapPinIcon className='size-3' />
}

type InlineForm = { value: unknown }
type InlineHint = { key: string; label: string }

const getValidationHints = (
  def: ConfigDefinition,
  t: (key: string, opts?: Record<string, unknown>) => string
): InlineHint[] =>
  def.validations.flatMap((rule): InlineHint[] => {
    if ('minLength' in rule) {
      return [{ key: 'minLength', label: t('configsPage.card.hints.minLength', { n: rule.minLength }) }]
    }
    if ('maxLength' in rule) {
      return [{ key: 'maxLength', label: t('configsPage.card.hints.maxLength', { n: rule.maxLength }) }]
    }
    if ('min' in rule) {
      return [{ key: 'min', label: t('configsPage.card.hints.min', { n: rule.min }) }]
    }
    if ('max' in rule) {
      return [{ key: 'max', label: t('configsPage.card.hints.max', { n: rule.max }) }]
    }
    if ('email' in rule) {
      return [{ key: 'email', label: t('configsPage.card.hints.email') }]
    }
    if ('url' in rule) {
      return [{ key: 'url', label: t('configsPage.card.hints.url') }]
    }
    if ('integer' in rule) {
      return [{ key: 'integer', label: t('configsPage.card.hints.integer') }]
    }
    if ('pattern' in rule) {
      return [{ key: 'pattern', label: t('configsPage.card.hints.pattern') }]
    }
    return []
  })

export default function ConfigFieldRow({ config, onEdit }: ConfigFieldRowProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const { uploadFileWithToast, isUploading: isUploadingImage } = useUploadFileWithToast()
  const imageFileInputRef = useRef<HTMLInputElement>(null)

  const initialValue =
    config.value.inputType === InputType.multiSelect
      ? Array.isArray(config.value.value)
        ? config.value.value
        : []
      : config.value.value
  const form = useForm<InlineForm>({ defaultValues: { value: initialValue } })
  const isDirty = form.formState.isDirty
  const { errors } = form.formState

  const { mutate: saveValue, isPending: isSavingValue } = useMutation({
    mutationFn: (value: unknown) =>
      configService.updateConfig({
        id: config.id,
        body: { key: config.key, isPublic: false, value: { ...config.value, value } }
      }),
    onSuccess: (_, saved) => {
      toast.success(t('configKeys.toast.updated'))
      form.reset({ value: saved })
    },
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['configs'] })
  })

  const onSave = form.handleSubmit(({ value }) => {
    const validator = buildValueValidator(config.value)
    const result = validator.safeParse(value)
    if (!result.success) {
      form.setError('value', { type: 'manual', message: result.error.issues[0]?.message ?? 'Invalid' })
      return
    }
    saveValue(result.data)
  })

  const colorClass = INPUT_TYPE_COLOR[config.value.inputType] ?? 'text-gray-500 bg-gray-50'
  const icon = INPUT_TYPE_ICON[config.value.inputType]
  const hints = getValidationHints(config.value, t)
  const isBooleanLike = config.value.inputType === InputType.boolean || config.value.inputType === InputType.switch

  const valueInput = (() => {
    switch (config.value.inputType) {
      case InputType.boolean:
      case InputType.switch:
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Switch
                  id={`val-${config.id}`}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    saveValue(checked)
                  }}
                  disabled={isSavingValue}
                />
                <label
                  htmlFor={`val-${config.id}`}
                  className='cursor-pointer select-none text-sm text-muted-foreground'
                >
                  {field.value ? 'true' : 'false'}
                </label>
                {isSavingValue && <Spinner className='size-3.5' />}
              </div>
            )}
          />
        )
      case InputType.number:
        return (
          <Input
            type='number'
            className='h-8 text-sm'
            {...form.register('value', { valueAsNumber: true })}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.date:
        return <Input type='date' className='h-8 text-sm' {...form.register('value')} aria-invalid={!!errors.value} />
      case InputType.textarea:
        return (
          <Textarea
            rows={2}
            className='resize-none text-sm'
            {...form.register('value')}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.json:
      case InputType.address:
        return (
          <Textarea
            rows={3}
            placeholder='{}'
            className='resize-none font-mono text-xs'
            {...form.register('value')}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.select: {
        const options = config.value.options ?? []
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <Select
                value={String(field.value ?? '')}
                onValueChange={(val) => {
                  const matched = options.find((o) => String(o.value) === val)
                  field.onChange(matched?.value ?? val)
                }}
              >
                <SelectTrigger className='text-sm' size='sm' aria-invalid={!!errors.value}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )
      }
      case InputType.multiSelect: {
        const options = config.value.options ?? []
        const stringOptions = options.map((o) => ({ label: o.label, value: String(o.value) }))
        const valueMap = new Map(options.map((o) => [String(o.value), o.value]))
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => {
              const arr = (Array.isArray(field.value) ? field.value : []) as (string | number)[]
              return (
                <MultiSelectField<InlineForm>
                  name='value'
                  options={stringOptions}
                  value={arr.map(String)}
                  onValueChange={(next) => field.onChange(next.map((s) => valueMap.get(s) ?? s))}
                  placeholder={'configsPage.card.multiSelectPlaceholder' as I18nKey}
                  displayError={false}
                  triggerClassName='h-8'
                />
              )
            }}
          />
        )
      }
      case InputType.image:
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  ref={imageFileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    const url = await uploadFileWithToast({ file, showSuccessToast: false })
                    if (url) field.onChange(url)
                  }}
                />
                {field.value ? (
                  <div className='h-8 w-8 shrink-0 overflow-hidden rounded border'>
                    <img src={String(field.value)} alt='' className='size-full object-cover' />
                  </div>
                ) : null}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className={cn('h-8 flex-1 text-xs', !!errors.value && 'border-destructive')}
                  onClick={() => imageFileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? <Spinner data-icon='inline-start' /> : <UploadIcon data-icon='inline-start' />}
                  {isUploadingImage ? t('common.ui.uploading') : t('common.button.upload')}
                </Button>
              </div>
            )}
          />
        )
      default:
        return <Input className='h-8 text-sm' {...form.register('value')} aria-invalid={!!errors.value} />
    }
  })()

  const showHintsRow = config.value.required || hints.length > 0 || !!errors.value

  return (
    <Card className='p-3 rounded-2xl gap-0'>
      <div className='flex items-center gap-2 mb-2'>
        <span className={cn('flex size-5 shrink-0 items-center justify-center rounded text-xs font-bold', colorClass)}>
          {icon}
        </span>

        <div className='flex-1 flex items-start gap-0.5'>
          <span className='truncate text-sm font-medium'>{config.value.label}</span>
          {config.value.required && <span className='text-xs font-semibold text-destructive'>*</span>}
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='size-7'
          title={t('configsPage.card.editDefinition')}
          onClick={onEdit}
        >
          <PencilIcon className='size-3.5 text-muted-foreground' />
        </Button>
      </div>

      {/* Value input row */}
      <div className='flex items-start gap-2 pl-6'>
        <div className='flex-1 min-w-0'>{valueInput}</div>
        {!isBooleanLike && isDirty && (
          <Button size='sm' className='h-8 shrink-0' disabled={isSavingValue} onClick={onSave}>
            {isSavingValue ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSavingValue ? t('configsPage.card.saving') : t('configsPage.card.save')}
          </Button>
        )}
      </div>

      {/* Hints + error */}
      {showHintsRow && (
        <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-6'>
          {config.value.required && (
            <span className='text-xs text-muted-foreground'>{t('configsPage.card.required')}</span>
          )}
          {hints.map((hint) => (
            <span key={hint.key} className='text-xs text-muted-foreground'>
              {hint.label}
            </span>
          ))}
          {errors.value?.message && <span className='text-xs text-destructive'>{errors.value.message as string}</span>}
        </div>
      )}
    </Card>
  )
}
