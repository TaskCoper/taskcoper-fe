import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { RevenueType } from '@/types/project.type'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import type { AddProjectRevenueFormValues } from '../../core/validations'
import AddProjectRevenueForm from '../../revenue/components/add-project-revenue-form'
import { useAddProjectRevenue } from '../../revenue/hooks/use-add-project-revenue'

interface AddProjectRevenueDialogProps {
  projectIdentifier: string
  type: RevenueType
  children: React.ReactNode
}

export default function AddProjectRevenueDialog({ projectIdentifier, type, children }: AddProjectRevenueDialogProps) {
  const { t } = useTranslation()
  const { methods, addProjectRevenue, isAddingProjectRevenue } = useAddProjectRevenue()
  const [open, setOpen] = useState(false)

  const onSubmit: SubmitHandler<AddProjectRevenueFormValues> = (body) => {
    addProjectRevenue(
      { body },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )
  }

  const onClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      methods.reset({
        name: '',
        amount: 0,
        note: '',
        type,
        labelIds: [],
        projectIdentifier
      })
    }
  }, [open, projectIdentifier, methods, type])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          methods.reset()
        }
        setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>
            <Trans
              i18nKey={
                type === 'Revenue'
                  ? 'project.addProjectRevenue.title.cashIn'
                  : 'project.addProjectRevenue.title.cashOut'
              }
              components={{
                highlight: (
                  <span className={type === 'Revenue' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'} />
                )
              }}
            />
          </DialogTitle>
          <DialogDescription>
            {t(
              type === 'Revenue'
                ? 'project.addProjectRevenue.description.cashIn'
                : 'project.addProjectRevenue.description.cashOut'
            )}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <AddProjectRevenueForm />

            <div className='flex items-center justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>
                {t('common.button.cancel')}
              </Button>
              <Button disabled={isAddingProjectRevenue}>
                {isAddingProjectRevenue ? <Spinner /> : null}
                {t('common.button.add')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
