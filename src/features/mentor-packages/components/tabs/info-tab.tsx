import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MAX_COVER_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { CameraIcon, ImageOffIcon } from 'lucide-react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateMentorPackageFormValues } from '../../validations'
import UpdateMentorPackageForm from '../update-mentor-package-form'

interface InfoTabProps {
  onSubmit: (values: UpdateMentorPackageFormValues) => void
  onDelete: () => void
  onCoverImageChange: (file: File | null) => void
  isDeleting: boolean
  isUpdating: boolean
  isUploading: boolean
}

export default function InfoTab({
  onSubmit,
  onDelete,
  onCoverImageChange,
  isDeleting,
  isUpdating,
  isUploading
}: InfoTabProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-6 pb-8 max-w-7xl mx-auto'>
      <div>
        <p className='text-xl font-bold'>{t('mentorPackage.page.infoTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('mentorPackage.page.infoDescription')}</p>
      </div>

      <InfoTabForm
        onSubmit={onSubmit}
        onDelete={onDelete}
        onCoverImageChange={onCoverImageChange}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        isUploading={isUploading}
      />
    </div>
  )
}

function InfoTabForm({ onSubmit, onDelete, onCoverImageChange, isDeleting, isUpdating, isUploading }: InfoTabProps) {
  const { t } = useTranslation()
  const { handleSubmit, control } = useFormContext<UpdateMentorPackageFormValues>()
  const { isDirty } = useFormState()
  const coverImageUrl = useWatch({ control, name: 'coverImageUrl' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>{t('mentorPackage.form.coverImage')}</p>

        <FileDropzone
          value={coverImageUrl}
          onFileChange={onCoverImageChange}
          className={cn('group/cover relative h-48 rounded-xl border border-dashed border-border overflow-hidden')}
          maxSize={MAX_COVER_SIZE}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
            'image/svg+xml': ['.svg']
          }}
          disabled={isUploading || isUpdating}
        >
          {coverImageUrl ? (
            <img src={coverImageUrl} alt={t('mentorPackage.form.coverImage')} className='size-full object-cover' />
          ) : (
            <div className='size-full flex items-center justify-center bg-muted/50'>
              <ImageOffIcon className='size-10 text-muted-foreground' />
            </div>
          )}

          <Button
            type='button'
            size='sm'
            variant='outline'
            className='absolute bottom-3 right-3 gap-1.5 opacity-100 sm:opacity-0 sm:group-hover/cover:opacity-100 transition-opacity'
            disabled={isUploading || isUpdating}
          >
            <CameraIcon className='size-4' />
            {t('common.button.upload')}
          </Button>
        </FileDropzone>

        <p className='text-xs text-muted-foreground'>{t('mentorPackage.form.coverImageHint')}</p>
      </div>

      <UpdateMentorPackageForm />

      <div className='flex justify-end items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          className='w-full sm:w-auto text-destructive border-destructive/40 hover:text-destructive'
          onClick={onDelete}
          disabled={isDeleting || isUpdating || isUploading}
        >
          {isDeleting ? <Spinner /> : null}
          {t('common.button.delete')}
        </Button>

        <Button type='submit' className='w-full sm:w-auto' disabled={!isDirty || isUpdating || isUploading}>
          {isUpdating || isUploading ? <Spinner /> : null}
          {t('common.button.save')}
        </Button>
      </div>
    </form>
  )
}
