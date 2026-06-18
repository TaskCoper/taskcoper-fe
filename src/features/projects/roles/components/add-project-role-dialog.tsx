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
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddProjectRole } from '../hooks/use-add-project-role'
import type { AddProjectRoleFormValues } from '../validations'
import AddProjectRoleForm from './add-project-role-form'

interface AddProjectRoleDialogProps {
  children: React.ReactNode
  projectIdentifier: string
}

export default function AddProjectRoleDialog({ children, projectIdentifier }: AddProjectRoleDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { methods, addProjectRole, isAddingProjectRole } = useAddProjectRole()

  const onSubmit: SubmitHandler<AddProjectRoleFormValues> = async (body) => {
    addProjectRole(
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
    methods.reset()
  }

  useEffect(() => {
    if (open) {
      methods.reset({
        projectIdentifier,
        description: '',
        isDefault: false,
        name: '',
        permissions: []
      })
    }
  }, [open, projectIdentifier, methods])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('project.addProjectRole.title')}</DialogTitle>
          <DialogDescription>{t('project.addProjectRole.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <AddProjectRoleForm />

            <div className='flex items-center justify-end gap-2'>
              <Button type='button' variant='ghost' onClick={onClose}>
                {t('common.button.cancel')}
              </Button>
              <Button disabled={isAddingProjectRole}>
                {isAddingProjectRole ? <Spinner /> : null}
                {t('common.button.create')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
