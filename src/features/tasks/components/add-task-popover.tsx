import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useGetChildMilestones } from '@/features/milestones/hooks/use-get-child-milestones'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddTask } from '../hooks/use-add-task'
import type { AddTaskFormValues } from '../validations'
import AddTaskWithMilestoneForm from './add-task-with-milestone-form'

interface AddTaskPopoverProps {
  children: React.ReactNode
  projectId: string
  parentMilestoneId: string
}

export default function AddTaskPopover({ children, projectId, parentMilestoneId }: AddTaskPopoverProps) {
  const { t } = useTranslation()
  const { methods, isTriggered, setIsTriggered, addTask, isAddingTask, recalculatePosition } = useAddTask({
    projectId,
    parentMilestoneId
  })

  const onSubmit: SubmitHandler<AddTaskFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      position: methods.getValues('position')
    }

    addTask({ body: updatedBody })
  }

  const { childMilestones, isLoadingChildMilestones } = useGetChildMilestones({
    parentMilestoneId,
    enabled: isTriggered
  })

  return (
    <Popover open={isTriggered} onOpenChange={setIsTriggered}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        className='w-72 p-4 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        align='end'
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full flex flex-col gap-2'>
            <AddTaskWithMilestoneForm
              milestones={childMilestones?.value.items ?? []}
              isLoading={isLoadingChildMilestones}
            />

            <Button type='submit' className='w-fit' disabled={isAddingTask}>
              {isAddingTask ? <Spinner /> : null}
              {t('common.button.add')}
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}
