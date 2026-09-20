import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { EyeIcon, SaveIcon, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { useRevealConfig } from '../../hooks/use-reveal-config'
import { useUpdateConfig } from '../../hooks/use-update-config'
import { isLockedAsyncConfigKey } from '../../locked-config-keys'
import { isProductSignatureKey } from '../../signature-landing-palette'
import { ConfigKind, InputType, type Config, type InputOption } from '../../types'
import type { CreateConfigFormValues } from '../../validations'
import { composeConfigBody, getGroupFromKey, useUnsavedCloseGuard } from './config-dialog-shared'
import IsPublicField from './is-public-field'
import UpdateConfigForm from './create-config-form'

interface UpdateConfigDialogProps {
  open: boolean
  config: Config | null
  onClose: () => void
  liveOptionsByKey?: Record<string, InputOption[]>
  /** Gọi lại API nguồn của options cho config này; trả `null` với key không lấy options từ API. */
  onSyncOptions?: (key: string) => Promise<InputOption[] | null>
}

export default function UpdateConfigDialog({
  open,
  config,
  onClose,
  liveOptionsByKey,
  onSyncOptions
}: UpdateConfigDialogProps) {
  const { t } = useTenantTranslation()
  const { methods, updateConfig, isUpdatingConfig } = useUpdateConfig(config?.id)
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const { revealConfig, isRevealingConfig } = useRevealConfig()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSyncingOptions, setIsSyncingOptions] = useState(false)

  const isLocked = isLockedAsyncConfigKey(config?.key)
  const isSecret = config?.kind === ConfigKind.secret
  const canSyncOptions = !!onSyncOptions && !!config && isLocked

  const isWideEditor = isProductSignatureKey(config?.key) && config?.value.inputType === InputType.json

  const handleReveal = () => {
    if (!config) return
    revealConfig(
      { id: config.id },
      {
        onSuccess: (revealed) => {
          methods.setValue('value.value', revealed.value.value, { shouldDirty: false, shouldValidate: true })
          setIsRevealed(true)
        }
      }
    )
  }

  // Đọc qua ref: một lượt refetch options chạy nền không được kích hoạt lại `reset` bên dưới và
  // xoá phần đang sửa dở. Muốn làm mới options giữa chừng thì bấm nút sync.
  const liveOptionsRef = useRef(liveOptionsByKey)
  liveOptionsRef.current = liveOptionsByKey

  useEffect(() => {
    if (open && config) {
      const liveOptions = config.key ? liveOptionsRef.current?.[config.key] : undefined
      // `config` lấy thẳng từ API nên `value` có thể thiếu ở record dữ liệu hỏng.
      const group = getGroupFromKey(config.key) || config.value?.group || ''
      methods.reset({
        key: config.key,
        group,
        kind: config.kind,
        isPublic: config.isPublic ?? false,
        value: {
          ...(config.value as CreateConfigFormValues['value']),
          group,
          options: liveOptions ?? (config.value as CreateConfigFormValues['value']).options
        }
      })
    }
  }, [open, config, methods])

  const handleSyncOptions = async () => {
    if (!config || !onSyncOptions) {
      return
    }
    setIsSyncingOptions(true)

    try {
      const freshOptions = await onSyncOptions(config.key)
      if (!freshOptions) return

      methods.setValue('value.options', freshOptions, { shouldDirty: true, shouldValidate: true })

      const allowed = new Set(freshOptions.map((option) => String(option.value)))
      const current = methods.getValues('value.value')
      let droppedCount = 0

      if (Array.isArray(current)) {
        const kept = current.filter((item) => allowed.has(String(item)))
        droppedCount = current.length - kept.length

        if (droppedCount > 0) {
          methods.setValue('value.value', kept, { shouldDirty: true, shouldValidate: true })
        }
      } else if (current != null && current !== '' && !allowed.has(String(current))) {
        droppedCount = 1
        methods.setValue('value.value', undefined, { shouldDirty: true, shouldValidate: true })
      }

      if (droppedCount > 0) {
        toast.warning(t('configsPage.dialog.syncOptionsDropped', { count: droppedCount }))
      } else {
        toast.success(t('configsPage.dialog.syncOptionsSuccess', { count: freshOptions.length }))
      }
    } catch {
      toast.error(t('configsPage.dialog.syncOptionsError'))
    } finally {
      setIsSyncingOptions(false)
    }
  }

  const handleClose = () => {
    setPendingFile(null)
    setIsRevealed(false)
    setIsSyncingOptions(false)
    onClose()
  }

  const requestClose = useUnsavedCloseGuard(methods.formState.isDirty, handleClose)

  const onSubmit: SubmitHandler<CreateConfigFormValues> = async (body) => {
    if (isSecret && !isRevealed) return

    let resolvedValue = body.value.value

    if (pendingFile && body.value.inputType === InputType.file) {
      const url = await uploadFileWithToast({ file: pendingFile, showSuccessToast: false })
      if (!url) return
      resolvedValue = url
    }

    updateConfig({ body: composeConfigBody(body, resolvedValue) }, { onSuccess: handleClose })
  }

  const isSubmitting = isUpdatingConfig || isUploading || isSyncingOptions

  return (
    <Dialog open={open} onOpenChange={(o) => !o && void requestClose()}>
      <DialogContent
        position='top-center'
        className={cn(
          'flex flex-col gap-0 overflow-hidden p-0 min-w-[95%]',
          isWideEditor ? 'lg:min-w-3xl' : 'lg:min-w-xl'
        )}
      >
        <DialogHeader className='px-6 pt-6 pb-4'>
          <DialogTitle>{t('configsPage.dialog.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6'>
          {isSecret && !isRevealed && (
            <div className='mb-3 flex items-center gap-3 rounded-lg border border-primary/40 border-dashed bg-primary/10 pl-3 pr-2 py-2'>
              <p className='flex-1 text-xs text-primary font-medium'>{t('configsPage.dialog.secretHint')}</p>
              <Button type='button' size='sm' disabled={isRevealingConfig} onClick={handleReveal}>
                {isRevealingConfig ? <Spinner data-icon='inline-start' /> : <EyeIcon data-icon='inline-start' />}
                {t('configsPage.dialog.revealSecret')}
              </Button>
            </div>
          )}

          <FormProvider {...methods}>
            <form id='update-config-form' onSubmit={methods.handleSubmit(onSubmit)} className='pb-4'>
              <UpdateConfigForm
                lockedFields={isLocked ? { key: true, options: true, kind: true } : undefined}
                onPendingFileChange={setPendingFile}
                valueLocked={isSecret && !isRevealed}
                onSyncOptions={canSyncOptions ? handleSyncOptions : undefined}
                isSyncingOptions={isSyncingOptions}
              />
              <IsPublicField control={methods.control} />
            </form>
          </FormProvider>
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          {/* Xoá config đang tạm khoá: nút vẫn hiện nhưng không bấm được. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='mr-auto inline-flex'>
                <Button type='button' variant='destructive' disabled className='pointer-events-none'>
                  <Trash2 className='size-3.5' />
                  {t('configsPage.dialog.delete')}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('configsPage.dialog.deleteDisabledTooltip')}</TooltipContent>
          </Tooltip>
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => void requestClose()}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button
            type='submit'
            form='update-config-form'
            disabled={isSubmitting || (isSecret && !isRevealed)}
            title={isSecret && !isRevealed ? t('configsPage.card.secretLockedTooltip') : undefined}
          >
            {isSubmitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSubmitting ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
