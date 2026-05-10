import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { MAX_BACKGROUND_SIZE } from '@/shared/constants'
import { ImageOffIcon, XIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

interface BackgroundImagePopoverProps {
  children: React.ReactNode
  onSubmit: () => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

export default function BackgroundImagePopover({
  children,
  onSubmit,
  open,
  setOpen,
  disabled = false
}: BackgroundImagePopoverProps) {
  const onClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        onInteractOutside={onClose}
        sideOffset={8}
        align='end'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
      >
        <BackgroundImagePopoverContent onSubmit={onSubmit} onClose={onClose} />
      </PopoverContent>
    </Popover>
  )
}

interface BackgroundImagePopoverContentProps {
  onSubmit: () => void
  onClose: () => void
}

function BackgroundImagePopoverContent({ onSubmit, onClose }: BackgroundImagePopoverContentProps) {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext()
  const backgroundImage = watch('backgroundImage')

  const { identifier } = useParams<{ identifier: string }>()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canDelete = check('TASKS', 'canDelete')

  const { uploadFileWithToast } = useUploadFileWithToast()

  const handleUpload = async (file: File | null) => {
    if (!file) return

    const url = await uploadFileWithToast({
      file,
      renderProgress: (progress) => (
        <div className='w-full min-w-48 space-y-1'>
          <Progress value={progress} className='w-full' />
          <p className='text-xs text-muted-foreground'>{progress}%</p>
        </div>
      )
    })

    if (!url) return

    setValue('backgroundImage', url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    onSubmit()
    onClose()
  }

  const handleRemove = () => {
    setValue('backgroundImage', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    onSubmit()
    onClose()
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex items-center justify-center relative'>
        <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.detail.backgroundImage')}</p>
        <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={onClose} />
      </div>

      {backgroundImage ? (
        <img src={backgroundImage} alt='Background' className='w-full h-32 object-cover rounded-md' />
      ) : (
        <div className='w-full h-32 rounded-md bg-muted flex items-center justify-center'>
          <ImageOffIcon className='size-8 text-muted-foreground' />
        </div>
      )}

      <div className='flex justify-end items-center gap-2'>
        {canDelete ? (
          <Button size='sm' variant='ghost' onClick={handleRemove}>
            {t('common.button.remove')}
          </Button>
        ) : null}

        <FileDropzone
          onFileChange={handleUpload}
          maxSize={MAX_BACKGROUND_SIZE}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
            'image/svg+xml': ['.svg']
          }}
        >
          <Button size='sm'>{t('task.detail.chooseImage')}</Button>
        </FileDropzone>
      </div>
    </div>
  )
}
