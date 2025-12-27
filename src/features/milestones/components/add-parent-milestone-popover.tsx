import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddParentMilestone } from '../hooks/use-add-parent-milestone'
import type { AddParentMilestoneFormValues } from '../validations'
import AddParentMilestoneForm from './add-parent-milestone-form'

interface AddParentMilestonePopoverProps {
  children: React.ReactNode
  projectId: string
}

export default function AddParentMilestonePopover({ children, projectId }: AddParentMilestonePopoverProps) {
  const { t } = useTranslation()
  const { methods, open, setOpen, addParentMilestone, isAddingParentMilestone, recalculatePosition } =
    useAddParentMilestone({ projectId })

  const onSubmit: SubmitHandler<AddParentMilestoneFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      position: methods.getValues('position')
    }
    addParentMilestone({ body: updatedBody })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-72 p-4 mt-1' align='start'>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-2'>
            <AddParentMilestoneForm />
            <Button type='submit' disabled={isAddingParentMilestone}>
              {isAddingParentMilestone ? <Spinner /> : null}
              {t('common.add')}
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}
