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
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateProject } from '../hooks/use-create-project'
import type { CreateProjectFormValues } from '../validations'
import CreateProjectForm from './create-project-form'

interface CreateProjectDialogProps {
  children: React.ReactNode
}

export default function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const { t } = useTranslation()

  const { methods, open, setOpen, createProject, isCreatingProject } = useCreateProject()

  const onSubmit: SubmitHandler<CreateProjectFormValues> = (body) => {
    createProject({ body })
  }

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        position='top-center'
        className='w-[95vw] sm:w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>{t('project.createProject.title')}</DialogTitle>
          <DialogDescription>{t('project.createProject.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-4'>
            <CreateProjectForm />

            <div className='flex flex-col-reverse sm:flex-row items-center gap-3 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='w-full sm:w-auto'
                disabled={isCreatingProject}
              >
                {t('project.createProject.cancel')}
              </Button>
              <Button type='submit' className='w-full sm:w-auto' disabled={isCreatingProject}>
                {isCreatingProject ? <Spinner /> : null}
                {t('project.createProject.submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
