import AvatarWithTooltip from '@/components/avatar-with-tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { useTaskUIStore } from '@/lib/zustand/task-ui.store'
import { cn, getColorTextClass } from '@/shared/utils'
import type { TaskMember, TaskPreview } from '@/types/task.type'
import { cva, type VariantProps } from 'class-variance-authority'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  CircleCheckBigIcon,
  ClockIcon,
  EyeIcon,
  MessageSquareIcon,
  PaperclipIcon,
  SquarePenIcon,
  StarIcon,
  TypeIcon
} from 'lucide-react'
import { forwardRef, useState, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { getTaskPriorityIcon } from '../constants'
import { useUpdateTaskStatus } from '../hooks/use-update-task-status'

const taskCardVariants = cva(
  'gap-0 p-0 border-none rounded-md cursor-pointer hover:ring-2 hover:ring-primary relative group/card overflow-hidden',
  {
    variants: {
      dragging: {
        over: 'opacity-50',
        overlay: 'ring-2 ring-primary'
      }
    }
  }
)

interface TaskCardProps extends VariantProps<typeof taskCardVariants> {
  task: TaskPreview
  style?: CSSProperties
  shouldDisplayParentMilestone?: boolean
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, dragging, style, shouldDisplayParentMilestone = false, ...props }, ref) => {
    const location = useLocation()
    const navigate = useNavigate()

    const { user } = useAuthStore()
    const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()

    const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
    const canToggleTaskStatus = check('TASKS', 'canUpdate', 'canToggleTaskStatus')

    const { areLabelsExpanded, toggleLabelsExpanded } = useTaskUIStore()
    const { updateTaskStatus, isUpdatingTaskStatus } = useUpdateTaskStatus({
      taskId: task.id,
      projectIdentifier: identifier,
      parentMilestoneIdentifier: milestoneIdentifier
    })

    const isWatchingTask = task.members.find((x) => !x.isMemberInTask && x.userId === user?.UserId) !== undefined

    const isDisplayIcons =
      isWatchingTask ||
      task.startDate ||
      task.endDate ||
      task.totalComments > 0 ||
      task.completedSubtasks > 0 ||
      task.members.filter((x) => x.isMemberInTask).length > 0 ||
      task.progressPercentage > 0 ||
      task.totalResources > 0 ||
      task.totalSubtasks > 0 ||
      task.priority ||
      (task?.estimatedPoints && task.estimatedPoints > 0) ||
      task.hasDescription

    const handleLabelClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggleLabelsExpanded()
    }

    const handleCardClick = () => {
      navigate(`${location.pathname}/tasks/${task.slug}`)
    }

    return (
      <Card ref={ref} style={style} className={taskCardVariants({ dragging })} {...props} onClick={handleCardClick}>
        {task.backgroundImage ? (
          <div className='relative w-full h-44 shrink-0 group bg-gray-300/80'>
            <img src={task.backgroundImage} alt='Cover' className='w-full h-full object-cover' />
          </div>
        ) : null}

        <div className='p-3 flex flex-col gap-1'>
          {task.taskLabels?.length > 0 ? (
            <div className='flex items-center gap-1 flex-wrap w-[90%]'>
              {task.taskLabels.map((label) =>
                areLabelsExpanded ? (
                  <div
                    key={label.id}
                    onClick={handleLabelClick}
                    className={cn(
                      label.color || 'bg-gray-200',
                      'px-2 min-w-14 h-4 rounded-sm flex justify-center items-center cursor-pointer max-w-full transition-all duration-200 hover:saturate-80'
                    )}
                  >
                    <span className={cn('text-xs font-semibold truncate', getColorTextClass(label.color))}>
                      {label.name}
                    </span>
                  </div>
                ) : (
                  <div
                    key={label.id}
                    onClick={handleLabelClick}
                    className={cn(
                      label.color || 'bg-gray-200',
                      'h-2 rounded-full w-10 cursor-pointer transition-all duration-200 hover:saturate-80'
                    )}
                  />
                )
              )}
            </div>
          ) : null}
          <div
            className={cn(
              'size-6 hidden group-hover/card:flex items-center justify-center absolute right-1 top-2',
              task.backgroundImage ? 'bg-white z-10 rounded-full right-2' : 'bg-transparent'
            )}
          >
            <SquarePenIcon className='size-3.5' />
          </div>
          <div className='space-y-0.5'>
            {shouldDisplayParentMilestone ? (
              <Link
                to={`/projects/${identifier}/milestones/${task.parentMilestoneSlug}`}
                className='text-xs font-medium text-muted-foreground hover:underline hover:text-primary'
                onClick={(e) => e.stopPropagation()}
              >
                {task.parentMilestoneName}
              </Link>
            ) : null}
            <div className='flex items-start gap-2'>
              <Checkbox
                className={cn(
                  'rounded-full border-foreground z-10 mt-0.5',
                  !task.isCompleted && 'hidden group-hover/card:block',
                  !canToggleTaskStatus ? 'cursor-not-allowed' : ''
                )}
                checked={task.isCompleted}
                disabled={isUpdatingTaskStatus || !canToggleTaskStatus}
                onCheckedChange={(checked) => {
                  updateTaskStatus({ id: task.id, isCompleted: checked as boolean })
                }}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              />
              <p className={cn('text-sm w-[80%]', task.isCompleted ? 'text-muted-foreground' : '')}>{task.name}</p>
            </div>
          </div>

          {isDisplayIcons ? (
            <div
              className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-2 mt-1',
                task.progressPercentage > 0 ? 'mb-1' : ''
              )}
            >
              {isWatchingTask ? <EyeIcon className='size-3.5' /> : null}
              {task.hasDescription ? <TypeIcon className='size-3' /> : null}
              {task.startDate || task.endDate ? (
                <TaskDateChip startDate={task.startDate} endDate={task.endDate} />
              ) : null}
              {task.estimatedPoints && task.estimatedPoints > 0 ? (
                <TaskStoryPointsChip storyPoints={task.estimatedPoints} />
              ) : null}
              {task.totalSubtasks > 0 ? (
                <TaskSubtasksChip completedSubtasks={task.completedSubtasks} totalSubtasks={task.totalSubtasks} />
              ) : null}
              {task.totalComments > 0 ? <TaskCommentChip commentCount={task.totalComments} /> : null}
              {task.totalResources > 0 ? <TaskAttachmentChip totalResources={task.totalResources} /> : null}
              {task.priority || task.members.filter((x) => x.isMemberInTask).length > 0 ? (
                <div className='ml-auto flex items-center gap-2'>
                  {task.priority ? getTaskPriorityIcon()[task.priority] : null}
                  {task.members.filter((x) => x.isMemberInTask).length > 0 ? (
                    <TaskMembersChip members={task.members.filter((x) => x.isMemberInTask)} />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {task.progressPercentage > 0 && (
            <div className='absolute bottom-0 left-0 right-0 h-1'>
              <div
                className='h-full bg-primary transition-all duration-300'
                style={{ width: `${task.progressPercentage.toFixed(0)}%` }}
              />
            </div>
          )}
        </div>
      </Card>
    )
  }
)

TaskCard.displayName = 'TaskCard'
export default TaskCard

const TaskStoryPointsChip = ({ storyPoints }: { storyPoints: number }) => {
  return (
    <div className='flex items-center gap-1 rounded-sm'>
      <StarIcon className='size-3 text-primary' />
      <p className='text-xs font-semibold text-primary'>{storyPoints}</p>
    </div>
  )
}

const TaskDateChip = ({ startDate, endDate }: { startDate: string | null; endDate: string | null }) => {
  return (
    <div className='flex items-center gap-1.5 rounded-sm'>
      <ClockIcon className='size-3' />
      <div className='flex items-center gap-1'>
        {startDate && (
          <p className='text-xs font-semibold text-muted-foreground'>
            {format(new Date(startDate), "d 'thg' M y", { locale: vi })}
          </p>
        )}
        {startDate && endDate && <p className='text-xs font-semibold text-muted-foreground'>–</p>}
        {endDate && (
          <p className='text-xs font-semibold text-muted-foreground'>
            {format(new Date(endDate), "d 'thg' M y", { locale: vi })}
          </p>
        )}
      </div>
    </div>
  )
}

const TaskCommentChip = ({ commentCount }: { commentCount: number }) => {
  return (
    <div className='flex items-center gap-1 rounded-sm'>
      <MessageSquareIcon className='size-3' />
      <p className='text-xs font-semibold text-muted-foreground'>{commentCount}</p>
    </div>
  )
}

const TaskMembersChip = ({ members }: { members: TaskMember[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div role='button' className='flex items-center *:ring-2 *:ring-primary *:ring-offset-1 cursor-pointer'>
      {members.slice(0, 4).map((member, index) => (
        <AvatarWithTooltip
          key={member.userId}
          avatar={member.avatar}
          fullName={`${member.firstName} ${member.lastName}`}
          email={member.email}
          className='size-4'
          fallbackClassName='text-[10px]'
          isActive={activeIndex === index}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        />
      ))}
      {members.length > 4 && (
        <Avatar className='z-10 text-sm font-medium text-muted-foreground size-6'>
          <AvatarFallback>
            <p className='text-xs font-medium'>+{members.length - 1}</p>
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

const TaskSubtasksChip = ({
  completedSubtasks,
  totalSubtasks
}: {
  completedSubtasks: number
  totalSubtasks: number
}) => {
  return (
    <div className='flex items-center gap-1'>
      <CircleCheckBigIcon className='size-3' />
      <p className='text-xs font-semibold text-muted-foreground'>
        {completedSubtasks}/{totalSubtasks}
      </p>
    </div>
  )
}

const TaskAttachmentChip = ({ totalResources }: { totalResources: number }) => {
  return (
    <div className='flex items-center gap-1'>
      <PaperclipIcon className='size-3' />
      <p className='text-xs font-semibold text-muted-foreground'>{totalResources}</p>
    </div>
  )
}
