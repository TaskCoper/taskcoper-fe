import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import { ChevronDownIcon, EyeIcon, ImageIcon, MoreHorizontalIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useFormContext, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useToggleWatchTask } from '../hooks/use-toggle-watch-task'
import type { TaskDetail } from '../types'
import type { UpdateTaskFormValues } from '../validations'
import BackgroundImagePopover from './background-image-popover'
import MoveTaskPopoverV2 from './move-task-popover-v2'
import TaskDetailMenu from './task-detail-menu'

const MILESTONE_BUTTON_CLASSES = 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
const ROUND_ICON_BUTTON_CLASSES = 'rounded-full'

interface TaskDialogHeaderProps {
  task: TaskDetail | null | undefined
  identifier?: string
  milestoneIdentifier?: string
  canMoveTask: boolean
  canUpdate: boolean
  isWatchingTask: boolean
  onSubmitUpdateTask: SubmitHandler<UpdateTaskFormValues>
  handleClose: () => void
  goBack: () => void
}

export default function TaskDialogHeader({
  task,
  identifier,
  milestoneIdentifier,
  canMoveTask,
  canUpdate,
  isWatchingTask,
  onSubmitUpdateTask,
  handleClose,
  goBack
}: TaskDialogHeaderProps) {
  const { t } = useTranslation()
  const { handleSubmit } = useFormContext<UpdateTaskFormValues>()
  const [openTaskDetailMenu, setOpenTaskDetailMenu] = useState(false)
  const [openBackgroundImagePopover, setOpenBackgroundImagePopover] = useState(false)
  const { toggleWatchTask } = useToggleWatchTask({ projectIdentifier: identifier, milestoneIdentifier })

  return (
    <>
      {task?.backgroundImage ? (
        <div className='relative w-full h-44 shrink-0 group rounded-t-3xl bg-gray-300/80 shadow-[inset_0_4px_4px_-4px_var(--task-dialog-inset-shadow-color),inset_4px_0_4px_-4px_var(--task-dialog-inset-shadow-color),inset_-4px_0_4px_-4px_var(--task-dialog-inset-shadow-color)]'>
          <img
            src={task.backgroundImage}
            alt={t('task.detail.backgroundImage')}
            className='w-full h-full object-contain'
          />
        </div>
      ) : null}

      <div
        className={cn(
          'p-5 flex items-center justify-between gap-2 z-10',
          task?.backgroundImage ? 'absolute top-0 left-0 right-0' : ''
        )}
      >
        {identifier && milestoneIdentifier && task?.taskId && task?.milestoneId && task?.taskSlug && canMoveTask ? (
          <MoveTaskPopoverV2
            projectIdentifier={identifier}
            taskIdentifier={task.taskSlug}
            taskId={task.taskId}
            taskParentMilestoneSlug={task.parentMilestoneSlug}
            taskMilestoneId={task.milestoneId}
          >
            <Button size='sm' variant='outline' className={MILESTONE_BUTTON_CLASSES}>
              {task?.milestoneName}
              <ChevronDownIcon />
            </Button>
          </MoveTaskPopoverV2>
        ) : (
          <Button size='sm' variant='outline' className={MILESTONE_BUTTON_CLASSES}>
            {task?.milestoneName}
          </Button>
        )}

        <div className='flex items-center gap-2'>
          {isWatchingTask ? (
            <Button
              className={ROUND_ICON_BUTTON_CLASSES}
              variant='default'
              size='icon-sm'
              disabled={!canUpdate}
              onClick={() => {
                if (!task?.taskId) return
                toggleWatchTask({ taskId: task.taskId, isWatching: false })
              }}
            >
              <EyeIcon />
            </Button>
          ) : null}

          <BackgroundImagePopover
            onSubmit={handleSubmit(onSubmitUpdateTask)}
            open={openBackgroundImagePopover}
            setOpen={setOpenBackgroundImagePopover}
            disabled={!canUpdate}
          >
            <Button
              className={ROUND_ICON_BUTTON_CLASSES}
              variant={openBackgroundImagePopover ? 'default' : 'outline'}
              size='icon-sm'
            >
              <ImageIcon />
            </Button>
          </BackgroundImagePopover>

          {task?.taskId && task?.taskSlug && task?.taskName && identifier && milestoneIdentifier && task.milestoneId ? (
            <TaskDetailMenu
              projectIdentifier={identifier}
              parentMilestoneIdentifier={milestoneIdentifier}
              milestoneId={task.milestoneId}
              taskId={task.taskId}
              taskName={task.taskName}
              onDeleteSuccess={goBack}
              open={openTaskDetailMenu}
              setOpen={setOpenTaskDetailMenu}
              isWatchingTask={isWatchingTask}
              taskIdentifier={task.taskSlug}
            >
              <Button
                className={ROUND_ICON_BUTTON_CLASSES}
                variant={openTaskDetailMenu ? 'default' : 'outline'}
                size='icon-sm'
              >
                <MoreHorizontalIcon />
              </Button>
            </TaskDetailMenu>
          ) : null}

          <Button className={ROUND_ICON_BUTTON_CLASSES} variant='outline' size='icon-sm' onClick={handleClose}>
            <XIcon />
          </Button>
        </div>
      </div>
    </>
  )
}
