import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { MAX_BACKGROUND_SIZE } from '@/shared/constants'
import type { AxiosError } from 'axios'
import { ImageOffIcon, XIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface BackgroundImagePopoverProps {
  children: React.ReactNode
  onSubmit: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

export default function BackgroundImagePopover({ children, onSubmit, open, setOpen }: BackgroundImagePopoverProps) {
  const onClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
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

  const { uploadFileAsync } = useUploadFile()

  const handleUpload = async (file: File | null) => {
    if (!file) return

    const toastId = toast.loading(t('common.ui.uploading'), {
      description: t('common.ui.pleaseWait')
    })

    try {
      const url = await uploadFileAsync({
        file,
        onProgress: (progress) => {
          toast.loading(t('common.ui.uploading'), {
            id: toastId,
            description: (
              <div className='w-full min-w-48 space-y-1'>
                <Progress value={progress} className='w-full' />
                <p className='text-xs text-muted-foreground'>{progress}%</p>
              </div>
            )
          })
        }
      })

      if (url) {
        toast.success(t('common.ui.uploadSuccess'), {
          id: toastId,
          description: null
        })

        setValue('backgroundImage', url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        onSubmit()
        onClose()
      }
    } catch (error) {
      toast(t('error.somethingWentWrong'), {
        id: toastId,
        description: (error as AxiosError<ErrorResponse>).response?.data?.detail
      })
    }
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
        <Button size='sm' variant='ghost' onClick={handleRemove}>
          {t('common.button.remove')}
        </Button>

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
