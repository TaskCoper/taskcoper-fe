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
import { Code2Icon, ExternalLinkIcon, FileIcon, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { Controller } from 'react-hook-form'
import { isSecondsAsMinutesConfigKey } from '../../duration-config-keys'
import { InputType, type Config } from '../../types'
import DurationMinutesInput from '../generic/duration-minutes-input'
import { toOriginalOptionValue, toOriginalOptionValues } from './option-value'
import type { ConfigRowState, InlineForm } from './use-config-row'

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

interface Props {
  config: Config
  row: ConfigRowState
}

/** Render control sửa được tương ứng với `inputType` của một config. */
export default function ConfigValueControl({ config, row }: Props) {
  const { t } = useTenantTranslation()
  const { uploadFileWithToast, isUploading: isUploadingFile } = useUploadFileWithToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { form, errorMessage, errorId, isSavingValue, saveImmediately } = row
  const isInvalid = !!errorMessage
  // Trỏ control tới thông báo giải thích vì sao sai, để trình đọc màn hình đọc được lý do chứ
  // không chỉ "không hợp lệ".
  const describedBy = isInvalid ? errorId : undefined

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
                  // Autosave: loại này không có nút Lưu, nên thao tác gạt CHÍNH LÀ lệnh ghi.
                  saveImmediately(checked)
                }}
                disabled={isSavingValue}
              />
              <label htmlFor={`val-${config.id}`} className='cursor-pointer select-none text-sm text-muted-foreground'>
                {field.value ? 'true' : 'false'}
              </label>
              {isSavingValue && <Spinner className='size-3.5' />}
            </div>
          )}
        />
      )

    case InputType.number:
      // Vài key lưu theo giây nhưng nghĩ theo phút thì dễ hơn nhiều.
      if (isSecondsAsMinutesConfigKey(config.key)) {
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <DurationMinutesInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className='h-9 text-sm'
                  ariaInvalid={isInvalid}
                  ariaDescribedBy={describedBy}
                />
                <span className='shrink-0 text-xs text-muted-foreground'>{t('configsPage.card.minutesUnit')}</span>
              </div>
            )}
          />
        )
      }
      return (
        <Input
          type='number'
          className='h-9 text-sm'
          {...form.register('value', { valueAsNumber: true })}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
        />
      )

    case InputType.date:
      return (
        <Input
          type='date'
          className='h-9 text-sm'
          {...form.register('value')}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
        />
      )

    case InputType.textarea:
      return (
        <Textarea
          rows={3}
          className='resize-y text-sm'
          {...form.register('value')}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
        />
      )

    case InputType.json:
      return (
        <div className='flex h-9 items-center gap-2 rounded-md border border-dashed bg-muted/30 px-2.5 text-xs text-muted-foreground'>
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
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
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
              onValueChange={(emitted) => field.onChange(toOriginalOptionValue(options, emitted))}
            >
              <SelectTrigger className='text-sm' size='sm' aria-invalid={isInvalid} aria-describedby={describedBy}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
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
      const stringOptions = options.map((option) => ({ label: option.label, value: String(option.value) }))
      return (
        <Controller
          name='value'
          control={form.control}
          render={({ field }) => {
            const selected = (Array.isArray(field.value) ? field.value : []) as (string | number)[]
            return (
              <MultiSelectField<InlineForm>
                name='value'
                options={stringOptions}
                value={selected.map(String)}
                onValueChange={(next) => field.onChange(toOriginalOptionValues(options, next))}
                placeholder={'configsPage.card.multiSelectPlaceholder' as I18nKey}
                displayError={false}
                triggerClassName='h-9'
              />
            )
          }}
        />
      )
    }

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
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    event.target.value = ''
                    const uploadedUrl = await uploadFileWithToast({ file, showSuccessToast: false })
                    if (uploadedUrl) field.onChange(uploadedUrl)
                  }}
                />

                {url ? (
                  <Card
                    className={cn(
                      'h-9 min-w-0 flex-1 flex-row items-center gap-2 border bg-muted/30 py-1 pl-1.5 pr-2 shadow-none',
                      isInvalid && 'border-destructive'
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
                      isInvalid && 'border-destructive text-destructive'
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
                  className='shrink-0 text-xs'
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
      return (
        <Input
          className='h-9 text-sm'
          {...form.register('value')}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
        />
      )
  }
}
