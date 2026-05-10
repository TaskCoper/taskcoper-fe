import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Subtask } from '../../tasks/subtasks/types'
import { useDeleteSubtask } from '../hooks/use-delete-subtask'
import { useUpdateSubtask } from '../hooks/use-update-subtask'
import { useUpdateSubtaskStatus } from '../hooks/use-update-subtask-status'
import { updateSubtaskSchema, updateSubtaskStatusSchema } from '../validations'

interface SubtaskCardProps {
  subtask: Subtask
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export default function SubtaskCard({
  subtask,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: SubtaskCardProps) {
  const { t } = useTranslation()
  const { updateSubtask } = useUpdateSubtask({ taskId })
  const { updateSubtaskStatus } = useUpdateSubtaskStatus({ taskId, projectIdentifier, parentMilestoneIdentifier })
  const { deleteSubtask } = useDeleteSubtask({ taskId, projectIdentifier, parentMilestoneIdentifier })

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canDelete = check('TASKS', 'canDelete')
  const canUpdate = check('TASKS', 'canUpdate')

  const { isEditing, inputProps, triggerProps } = useInlineEdit({
    initialValue: subtask.name,
    clickType: 'single',
    onSave: (newName) => {
      const validated = updateSubtaskSchema(t).safeParse({
        id: subtask.id,
        name: newName,
        index: subtask.index,
        parentId: subtask.parentId
      })

      if (validated.success) {
        updateSubtask({ body: validated.data })
      }
    }
  })

  const handleCheckboxChange = (checked: boolean) => {
    const validated = updateSubtaskStatusSchema(t).safeParse({
      id: subtask.id,
      isCompleted: checked
    })

    if (validated.success) {
      updateSubtaskStatus({ body: validated.data })
    }
  }

  const handleDelete = () => {
    deleteSubtask({ id: subtask.id })
  }

  if (isEditing) {
    return (
      <div className='flex items-center gap-2'>
        <Checkbox checked={subtask.isCompleted} disabled />
        <Input type='text' className='h-7 text-sm px-2' {...inputProps} />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <Checkbox checked={subtask.isCompleted} onCheckedChange={handleCheckboxChange} disabled={!canUpdate} />
      <div className='flex items-center gap-2 w-full hover:bg-muted rounded-sm px-2 py-1 group/subtask-item'>
        <p
          className={cn('text-sm cursor-pointer w-full', canUpdate ? 'cursor-text' : 'cursor-default')}
          {...(canUpdate ? triggerProps : {})}
        >
          {subtask.name}
        </p>

        {canDelete ? (
          <XIcon
            className='size-4 cursor-pointer hidden group-hover/subtask-item:block hover:text-destructive'
            onClick={handleDelete}
          />
        ) : null}
      </div>
    </div>
  )
}
