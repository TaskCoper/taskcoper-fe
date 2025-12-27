import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { PlusIcon } from 'lucide-react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddMilestone } from '../hooks/use-add-milestone'
import type { AddMilestoneFormValues } from '../validations'
import AddMilestoneForm from './add-milestone-form'

export interface AddMilestoneButtonProps {
  parentId: string
  projectId: string
}

export default function AddMilestoneButton({ parentId, projectId }: AddMilestoneButtonProps) {
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

  if (isTriggered) {
    return (
      <Card className='w-64 shrink-0 p-2'>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full flex flex-col gap-2'>
            <AddMilestoneForm onBlur={() => setIsTriggered(false)} />

            <Button type='submit' className='w-full' disabled={isAddingMilestone}>
              {isAddingMilestone ? <Spinner /> : null}
              {t('common.add')}
            </Button>
          </form>
        </FormProvider>
      </Card>
    )
  } else {
    return (
      <Button
        variant='secondary'
        className='w-64 justify-start bg-muted/30 text-white hover:bg-muted/40'
        onClick={() => setIsTriggered(true)}
      >
        <PlusIcon />
        {t('project.tasks.addMilestone')}
      </Button>
    )
  }
}
