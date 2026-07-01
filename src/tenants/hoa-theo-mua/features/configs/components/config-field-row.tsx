import MultiSelectField from '@/components/multi-select-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlignJustifyIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Code2Icon,
  ExternalLinkIcon,
  EyeIcon,
  FileIcon,
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
import { useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useRevealConfig } from '../hooks/use-reveal-config'
import configService from '../services'
import { ConfigKind, INPUT_TYPE_COLOR, InputType, type Config, type ConfigDefinition } from '../types'
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
  [InputType.file]: <FileIcon className='size-3' />,
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

const getGroupFromKey = (key: string): string => key.split('.')[0] ?? ''

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'])

const getUrlExtension = (url: string): string => {
  const path = url.split('?')[0].split('#')[0]
  const last = path.split('/').pop() ?? ''
  const dot = last.lastIndexOf('.')
  return dot >= 0 ? last.slice(dot + 1).toLowerCase() : ''
}

const isImageUrl = (url: string): boolean => IMAGE_EXTENSIONS.has(getUrlExtension(url))

const getFilenameFromUrl = (url: string): string => {
  const path = url.split('?')[0].split('#')[0]
  return decodeURIComponent(path.split('/').pop() ?? url)
}

export default function ConfigFieldRow({ config, onEdit }: ConfigFieldRowProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const { uploadFileWithToast: uploadImageWithToast, isUploading: isUploadingImage } = useUploadFileWithToast()
  const { uploadFileWithToast: uploadFileWithToastFn, isUploading: isUploadingFile } = useUploadFileWithToast()

  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialValue =
    config.value.inputType === InputType.multiSelect
      ? Array.isArray(config.value.value)
        ? config.value.value
        : []
      : config.value.value
  const resolver = useMemo(() => zodResolver(z.object({ value: buildValueValidator(config.value) })), [config.value])
  const form = useForm<InlineForm>({ defaultValues: { value: initialValue }, resolver })
  const isDirty = form.formState.isDirty
  const { errors } = form.formState

  const { mutate: saveValue, isPending: isSavingValue } = useMutation({
    mutationFn: (value: unknown) => {
      const group = getGroupFromKey(config.key) || config.value.group

      return configService.updateConfig({
        id: config.id,
        body: {
          key: config.key,
          group,
          kind: config.kind,
          isPublic: config.isPublic,
          value: { ...config.value, group, value }
        }
      })
    },
    onSuccess: (_, saved) => {
      toast.success(t('configKeys.toast.updated'))
      form.reset({ value: saved })
    },
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['configs'] })
  })

  const { mutate: togglePublic, isPending: isTogglingPublic } = useMutation({
    mutationFn: (isPublic: boolean) => {
      const group = getGroupFromKey(config.key) || config.value.group

      return configService.updateConfig({
        id: config.id,
        body: { key: config.key, group, kind: config.kind, isPublic, value: { ...config.value, group } }
      })
    },
    onSuccess: () => toast.success(t('configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['configs'] })
  })

  const onSave = form.handleSubmit(({ value }) => saveValue(value))

  const isSecret = config.kind === ConfigKind.secret
  const [isRevealed, setIsRevealed] = useState(false)
  const { revealConfig, isRevealingConfig } = useRevealConfig()

  const handleReveal = () => {
    revealConfig(
      { id: config.id },
      {
        onSuccess: (revealed) => {
          form.reset({ value: revealed.value.value })
          setIsRevealed(true)
        },
        onError: () => toast.error(t('configKeys.toast.error'))
      }
    )
  }

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
        return (
          <div
            className={cn(
              'flex h-9 items-center gap-2 rounded-md border border-dashed bg-muted/30 px-2.5 text-xs text-muted-foreground'
            )}
          >
            <Code2Icon className='size-3.5 shrink-0' />
            <span className='flex-1 truncate'>{t('configsPage.card.complexValue')}</span>
          </div>
        )
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
                    const url = await uploadImageWithToast({ file, showSuccessToast: false })
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
      case InputType.file:
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => {
              const url = field.value ? String(field.value) : ''
              const isImage = url ? isImageUrl(url) : false
              const filename = url ? getFilenameFromUrl(url) : ''
              const ext = url ? getUrlExtension(url) : ''

              return (
                <div className='flex items-center gap-2'>
                  <input
                    type='file'
                    className='hidden'
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      e.target.value = ''
                      const uploadedUrl = await uploadFileWithToastFn({ file, showSuccessToast: false })
                      if (uploadedUrl) field.onChange(uploadedUrl)
                    }}
                  />

                  {url ? (
                    <Card
                      className={cn(
                        'flex-row h-9 min-w-0 flex-1 items-center gap-2 shadow-none border bg-muted/30 py-1 pl-1.5 pr-2',
                        !!errors.value && 'border-destructive'
                      )}
                    >
                      {isImage ? (
                        <div className='size-6 shrink-0 overflow-hidden rounded-md'>
                          <img src={url} alt='' className='size-full object-cover' />
                        </div>
                      ) : (
                        <div className='flex size-6 shrink-0 items-center justify-center rounded bg-background'>
                          <FileIcon className='size-3.5 text-muted-foreground' />
                        </div>
                      )}
                      <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                        <span className='truncate text-xs font-medium' title={filename}>
                          {filename}
                        </span>
                        {ext && (
                          <span className='shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground'>
                            {ext}
                          </span>
                        )}
                      </div>
                      <a
                        href={url}
                        target='_blank'
                        rel='noreferrer'
                        className='shrink-0 text-muted-foreground transition-colors hover:text-foreground'
                        title={t('common.button.open')}
                      >
                        <ExternalLinkIcon className='size-3.5' />
                      </a>
                    </Card>
                  ) : (
                    <div
                      className={cn(
                        'flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-dashed bg-muted/10 px-2.5 text-xs text-muted-foreground',
                        !!errors.value && 'border-destructive text-destructive'
                      )}
                    >
                      <FileIcon className='size-3.5 shrink-0' />
                      <span className='truncate'>{t('configsPage.card.noFile')}</span>
                    </div>
                  )}

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 shrink-0 text-xs'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingFile}
                  >
                    {isUploadingFile ? <Spinner data-icon='inline-start' /> : <UploadIcon data-icon='inline-start' />}
                    {isUploadingFile
                      ? t('common.ui.uploading')
                      : url
                        ? t('common.button.replace')
                        : t('common.button.upload')}
                  </Button>
                </div>
              )
            }}
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

        <Label
          htmlFor={`pub-${config.id}`}
          className='flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground'
          title={t('configsPage.card.publicTooltip')}
        >
          {t('configsPage.card.public')}
          <Switch
            id={`pub-${config.id}`}
            checked={config.isPublic}
            onCheckedChange={(checked) => togglePublic(checked)}
            disabled={isTogglingPublic}
          />
        </Label>

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
        <div className='flex-1 min-w-0'>
          {isSecret && !isRevealed ? (
            <div className='flex h-8 items-center gap-2 rounded-md border border-dashed bg-muted/30 px-2.5 text-xs text-muted-foreground'>
              <span className='flex-1 truncate font-mono tracking-widest'>••••••••</span>
            </div>
          ) : (
            valueInput
          )}
        </div>
        {isSecret && !isRevealed ? (
          <Button
            size='sm'
            variant='outline'
            className='h-8 shrink-0'
            disabled={isRevealingConfig}
            onClick={handleReveal}
          >
            {isRevealingConfig ? <Spinner data-icon='inline-start' /> : <EyeIcon data-icon='inline-start' />}
            {isRevealingConfig ? t('configsPage.card.revealing') : t('configsPage.card.reveal')}
          </Button>
        ) : (
          !isBooleanLike &&
          isDirty && (
            <Button size='sm' className='h-8 shrink-0' disabled={isSavingValue} onClick={onSave}>
              {isSavingValue ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
              {isSavingValue ? t('configsPage.card.saving') : t('configsPage.card.save')}
            </Button>
          )
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
