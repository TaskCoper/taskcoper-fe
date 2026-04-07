import { Checkbox } from '@/components/ui/checkbox'
import type { TaskRow } from '@/types/task.type'
import { useUpdateTaskStatus } from '../../hooks/use-update-task-status'

interface StatusCellProps {
  row: TaskRow
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export default function StatusCell({ row, projectIdentifier, parentMilestoneIdentifier }: StatusCellProps) {
  const { updateTaskStatus, isUpdatingTaskStatus } = useUpdateTaskStatus({
    taskId: row.id,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  return (
    <div className='flex justify-center items-center'>
      <Checkbox
        className='rounded-full border-foreground/40'
        checked={row.isCompleted}
        disabled={isUpdatingTaskStatus}
        onCheckedChange={(value) => {
          updateTaskStatus({ id: row.id, isCompleted: !!value })
        }}
      />
    </div>
  )
}
