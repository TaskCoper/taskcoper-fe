import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { PlusIcon } from 'lucide-react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddTask } from '../hooks/use-add-task'
import type { AddTaskFormValues } from '../validations'
import AddTaskForm from './add-task-form'

interface AddTaskButtonProps {
  milestoneId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export default function AddTaskButton({
  milestoneId,
  projectIdentifier,
  parentMilestoneIdentifier
}: AddTaskButtonProps) {
  const { t } = useTranslation()
  const { methods, isTriggered, setIsTriggered, addTask, isAddingTask, recalculatePosition } = useAddTask({
    milestoneId,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const onSubmit: SubmitHandler<AddTaskFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      position: methods.getValues('position')
    }
    addTask({ body: updatedBody })
  }

  if (isTriggered) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full flex flex-col gap-2'>
          <AddTaskForm onBlur={() => setIsTriggered(false)} />

          <Button type='submit' className='w-fit' disabled={isAddingTask} onClick={(e) => e.stopPropagation()}>
            {isAddingTask ? <Spinner /> : null}
            {t('common.button.add')}
          </Button>
        </form>
      </FormProvider>
    )
  } else {
    return (
      <Button
        className='w-full justify-start hover:bg-muted-foreground/10'
        variant='ghost'
        onClick={() => setIsTriggered(true)}
      >
        <PlusIcon />
        {t('project.tasks.addTask')}
      </Button>
    )
  }
}
