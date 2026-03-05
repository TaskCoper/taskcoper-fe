import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateProject } from '../../hooks/use-create-project'
import type { CreateProjectFormValues } from '../../validations'
import CreateProjectForm from '../forms/create-project-form' // ✅ fix import đúng

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
}

export default function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const { t } = useTranslation()
  const { methods, createProject, isCreatingProject } = useCreateProject()

  const onSubmit: SubmitHandler<CreateProjectFormValues> = (body) => {
    createProject({ body })
  }

  const handleClose = () => {
    methods.reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent
        position='top-center'
        className='w-[95vw] sm:w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'
        onInteractOutside={handleClose}
      >
        <DialogHeader>
          <DialogTitle>{t('project.createProject.title')}</DialogTitle>
          <DialogDescription>{t('project.createProject.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-4'>
            <div className='px-6 py-5 overflow-y-auto' style={{ maxHeight: 'calc(85dvh - 140px)' }}>
              <CreateProjectForm />
            </div>
            <div className='flex flex-col-reverse sm:flex-row items-center gap-3 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                className='w-full sm:w-auto'
                disabled={isCreatingProject}
              >
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' className='w-full sm:w-auto' disabled={isCreatingProject}>
                {isCreatingProject ? <Spinner /> : null}
                {t('common.button.submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
