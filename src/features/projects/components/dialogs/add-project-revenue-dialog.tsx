import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import type { RevenueType } from '@/types/project.type'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useAddProjectRevenue } from '../../hooks/use-add-project-revenue'
import type { AddProjectRevenueFormValues } from '../../validations'
import AddProjectRevenueForm from '../forms/add-project-revenue-form'

interface AddProjectRevenueDialogProps {
  projectId: string
  type: RevenueType
  children: React.ReactNode
}

export default function AddProjectRevenueDialog({ projectId, type, children }: AddProjectRevenueDialogProps) {
  const { t } = useTranslation()
  const { methods } = useAddProjectRevenue()

  const onSubmit: SubmitHandler<AddProjectRevenueFormValues> = (body) => {
    console.log(body)
  }

  useEffect(() => {
    methods.reset({
      name: '',
      amount: 0,
      note: '',
      type,
      labelIds: [],
      projectId
    })
  }, [projectId, methods, type])

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-xl'>
        <DialogHeader>
          <DialogTitle>
            <Trans
              i18nKey={
                type === 'CashIn' ? 'project.addProjectRevenue.title.cashIn' : 'project.addProjectRevenue.title.cashOut'
              }
              components={{
                highlight: (
                  <span className={type === 'CashIn' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'} />
                )
              }}
            />
          </DialogTitle>
          <DialogDescription>
            {t(
              type === 'CashIn'
                ? 'project.addProjectRevenue.description.cashIn'
                : 'project.addProjectRevenue.description.cashOut'
            )}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <AddProjectRevenueForm />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
