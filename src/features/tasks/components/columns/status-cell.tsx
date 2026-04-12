import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/shared/utils'
import type { TaskRow } from '@/types/task.type'
import { useUpdateTaskStatus } from '../../hooks/use-update-task-status'

interface StatusCellProps {
  row: TaskRow
  projectIdentifier: string
  parentMilestoneIdentifier: string
  canToggleStatus?: boolean
}

export default function StatusCell({
  row,
  projectIdentifier,
  parentMilestoneIdentifier,
  canToggleStatus = true
}: StatusCellProps) {
  const { updateTaskStatus, isUpdatingTaskStatus } = useUpdateTaskStatus({
    taskId: row.id,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  return (
    <div className='flex justify-center items-center'>
      <Checkbox
        className={cn('rounded-full border-foreground/40', !canToggleStatus && 'cursor-not-allowed')}
        checked={row.isCompleted}
        disabled={isUpdatingTaskStatus || !canToggleStatus}
        onCheckedChange={(value) => {
          updateTaskStatus({ id: row.id, isCompleted: !!value })
        }}
      />
    </div>
  )
}
