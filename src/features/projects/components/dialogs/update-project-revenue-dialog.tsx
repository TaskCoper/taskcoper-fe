import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { Revenue } from '@/types/project.type'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUpdateProjectRevenue } from '../../hooks/use-update-project-revenue'
import type { UpdateProjectRevenueFormValues } from '../../validations'
import UpdateProjectRevenueForm from '../forms/update-project-revenue-form'

interface UpdateProjectRevenueDialogProps {
  revenue: Revenue | null
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UpdateProjectRevenueDialog({
  revenue,
  projectId,
  open,
  onOpenChange
}: UpdateProjectRevenueDialogProps) {
  const { t } = useTranslation()
  const { methods, updateProjectRevenue, isUpdatingProjectRevenue } = useUpdateProjectRevenue()

  const onSubmit: SubmitHandler<UpdateProjectRevenueFormValues> = (body) => {
    updateProjectRevenue(
      { body },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  const onClose = () => {
    onOpenChange(false)
  }

  useEffect(() => {
    if (revenue && open) {
      methods.reset({
        projectTransactionId: revenue.id,
        projectId,
        name: revenue.name,
        amount: revenue.amount,
        type: revenue.type,
        note: revenue.note ?? '',
        labelIds: revenue.labels.map((l) => l.id)
      })
    }
  }, [revenue, projectId, methods, open])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        onOpenChange(open)
      }}
    >
      <DialogContent position='top-center' className='min-w-xl' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('project.updateProjectRevenue.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectRevenue.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <UpdateProjectRevenueForm />

            <div className='flex items-center justify-end gap-2'>
              <Button variant='ghost' type='button' onClick={onClose} disabled={isUpdatingProjectRevenue}>
                {t('common.button.cancel')}
              </Button>
              <Button disabled={!methods.formState.isDirty || isUpdatingProjectRevenue}>
                {isUpdatingProjectRevenue ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
