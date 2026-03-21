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
import { useAddMentorPackageRule } from '../hooks/use-add-mentor-package-rule'
import type { AddMentorPackageRuleFormValues } from '../validations'
import AddMentorPackageRuleForm from './add-mentor-package-rule-form'

interface AddMentorPackageRuleDialogProps {
  children: React.ReactNode
  mentorPackageId: string
}

export default function AddMentorPackageRuleDialog({ children, mentorPackageId }: AddMentorPackageRuleDialogProps) {
  const { t } = useTranslation()
  const { methods, open, setOpen, addMentorPackageRule, isAddingMentorPackageRule } =
    useAddMentorPackageRule(mentorPackageId)

  const onSubmit: SubmitHandler<AddMentorPackageRuleFormValues> = (body) => {
    addMentorPackageRule({ body })
  }

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        position='top-center'
        className='w-[95vw] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6'
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>{t('mentorPackageRule.add.title')}</DialogTitle>
          <DialogDescription>{t('mentorPackageRule.add.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-4'>
            <AddMentorPackageRuleForm />

            <div className='flex flex-col-reverse sm:flex-row items-center gap-3 justify-end'>
              <Button
                type='button'
                variant='ghost'
                onClick={onClose}
                className='w-full sm:w-auto'
                disabled={isAddingMentorPackageRule}
              >
                {t('common.button.cancel')}
              </Button>

              <Button type='submit' className='w-full sm:w-auto' disabled={isAddingMentorPackageRule}>
                {isAddingMentorPackageRule ? <Spinner /> : null}
                {t('common.button.submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
