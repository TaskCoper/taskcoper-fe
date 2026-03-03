import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddMilestone } from '../hooks/use-add-milestone'
import type { AddMilestoneFormValues } from '../validations'
import AddMilestoneForm from './add-milestone-form'

interface AddMilestonePopoverProps {
  children: React.ReactNode
  parentId: string
  projectId: string
}

export default function AddMilestonePopover({ children, parentId, projectId }: AddMilestonePopoverProps) {
  const { t } = useTranslation()
  const { methods, addMilestone, isAddingMilestone, isTriggered, setIsTriggered, recalculatePosition } =
    useAddMilestone({
      parentId,
      projectId
    })

  const onSubmit: SubmitHandler<AddMilestoneFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      position: methods.getValues('position')
    }
    addMilestone({ body: updatedBody })
  }

  return (
    <Popover open={isTriggered} onOpenChange={setIsTriggered}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        className='w-72 p-4 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        align='end'
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-2'>
            <AddMilestoneForm withLabel />
            <Button type='submit' disabled={isAddingMilestone}>
              {isAddingMilestone ? <Spinner /> : null}
              {t('common.button.add')}
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}
