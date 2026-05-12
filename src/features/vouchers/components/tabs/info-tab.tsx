import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useFormContext, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type UpdateVoucherFormValues } from '../../validations'
import UpdateVoucherForm from '../update-voucher-form'

interface InfoTabProps {
  onSubmit: (values: UpdateVoucherFormValues) => void
  onDelete: () => void
  isDeleting: boolean
  isUpdating: boolean
}

export default function InfoTab({ onSubmit, onDelete, isDeleting, isUpdating }: InfoTabProps) {
  const { t } = useTranslation()
  const { handleSubmit } = useFormContext<UpdateVoucherFormValues>()
  const { isDirty } = useFormState()

  return (
    <div className='grow space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('voucher.page.infoTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('voucher.page.infoDescription')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <UpdateVoucherForm />

        <div className='flex justify-end items-center gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='w-full sm:w-auto text-destructive border-destructive/40 hover:text-destructive'
            onClick={onDelete}
            disabled={isDeleting || isUpdating}
          >
            {isDeleting ? <Spinner /> : null}
            {t('common.button.delete')}
          </Button>

          <Button type='submit' size='sm' className='w-full sm:w-auto' disabled={!isDirty || isUpdating}>
            {isUpdating ? <Spinner /> : null}
            {t('common.button.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
