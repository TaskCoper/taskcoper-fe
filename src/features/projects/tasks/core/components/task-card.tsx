import AvatarWithTooltip from '@/components/avatar-with-tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useDateFormat } from '@/lib/date'
import { useTaskUIStore } from '@/lib/zustand/task-ui.store'
import { primaryControlEffectClasses } from '@/shared/effects'
import { cn, getColorTextClass } from '@/shared/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  CircleCheckBigIcon,
  ClockIcon,
  EyeIcon,
  LayersIcon,
  MessageSquareIcon,
  PaperclipIcon,
  SquarePenIcon,
  StarIcon,
  TypeIcon
} from 'lucide-react'
import { forwardRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import type { TaskPreview } from '../../../core/types'
import { useGetMyProjectPermissions } from '../../../roles/hooks/use-get-my-project-permissions'
import type { TaskMember } from '../../members/types'
import { getTaskPriorityIcon } from '../constants'
import { useUpdateTaskStatus } from '../hooks/use-update-task-status'

const taskCardVariants = cva(
  'gap-0 p-0 border-none cursor-pointer hover:ring-2 hover:ring-primary relative group/card overflow-hidden',
  {
    variants: {
      dragging: {
        over: 'opacity-50',
        overlay: 'ring-2 ring-primary'
      }
    }
  }
)

const TASK_CARD_IMAGE_INSET_SHADOW_CLASSES =
  'shadow-[inset_0_2px_2px_-2px_rgba(0,0,0,0.15),inset_2px_0_2px_-2px_rgba(0,0,0,0.15),inset_-2px_0_2px_-2px_rgba(0,0,0,0.15)]'

interface TaskCardProps extends VariantProps<typeof taskCardVariants> {
  task: TaskPreview
  style?: CSSProperties
  shouldDisplayParentMilestone?: boolean
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, dragging, style, shouldDisplayParentMilestone = false, ...props }, ref) => {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()

    const { me: user } = useGetMe()
    const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()

    const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
    const canToggleTaskStatus = check('TASKS', 'canUpdate', 'canToggleTaskStatus')

    const { areLabelsExpanded, toggleLabelsExpanded } = useTaskUIStore()
    const { updateTaskStatus, isUpdatingTaskStatus } = useUpdateTaskStatus({
      taskId: task.id,
      projectIdentifier: identifier,
      parentMilestoneIdentifier: milestoneIdentifier
    })

    const assignedMembers = task.members.filter((x) => x.isMemberInTask)
    const isWatchingTask = task.members.find((x) => !x.isMemberInTask && x.userId === user?.id) !== undefined

    const isDisplayIcons =
      isWatchingTask ||
      task.startDate ||
      task.endDate ||
      task.totalComments > 0 ||
      task.completedSubtasks > 0 ||
      assignedMembers.length > 0 ||
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
            <img src={task.backgroundImage} alt={t('common.alt.cover')} className='w-full h-full object-cover' />
            <div
              className={cn('pointer-events-none absolute inset-0 rounded-t-xl', TASK_CARD_IMAGE_INSET_SHADOW_CLASSES)}
            />
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

          <div className='space-y-1'>
            {shouldDisplayParentMilestone ? (
              <Link
                to={`/projects/${identifier}/milestones/${task.parentMilestoneSlug}`}
                className='text-xs font-semibold text-indigo-600 hover:underline hover:text-primary flex items-center gap-1.5'
                onClick={(e) => e.stopPropagation()}
              >
                <LayersIcon className='size-3' />
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
                'flex flex-wrap items-center gap-x-4 gap-y-2.5 mt-1',
                task.progressPercentage > 0 ? 'mb-1' : ''
              )}
            >
              {isWatchingTask ? <EyeIcon className='size-3.5' /> : null}
              {task.hasDescription ? <TypeIcon className='size-3' /> : null}
              {task.startDate || task.endDate ? (
                <TaskDateChip isCompleted={task.isCompleted} startDate={task.startDate} endDate={task.endDate} />
              ) : null}
              {task.estimatedPoints && task.estimatedPoints > 0 ? (
                <TaskStoryPointsChip storyPoints={task.estimatedPoints} />
              ) : null}
              {task.totalSubtasks > 0 ? (
                <TaskSubtasksChip completedSubtasks={task.completedSubtasks} totalSubtasks={task.totalSubtasks} />
              ) : null}
              {task.totalComments > 0 ? <TaskCommentChip commentCount={task.totalComments} /> : null}
              {task.totalResources > 0 ? <TaskAttachmentChip totalResources={task.totalResources} /> : null}
              {task.priority || assignedMembers.length > 0 ? (
                <div className='ml-auto flex items-center gap-2'>
                  {task.priority ? getTaskPriorityIcon()[task.priority] : null}
                  {assignedMembers.length > 0 ? <TaskMembersChip members={assignedMembers} /> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {task.progressPercentage > 0 && (
            <div className='absolute bottom-0 left-0 right-0 h-1'>
              <div
                className={cn('h-full transition-all duration-300', primaryControlEffectClasses)}
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

const TaskDateChip = ({
  startDate,
  endDate,
  isCompleted
}: {
  startDate: string | null
  endDate: string | null
  isCompleted: boolean
}) => {
  const { formatDate } = useDateFormat()
  const [currentTime] = useState(() => Date.now())
  const isExpired =
    !!(endDate && !Number.isNaN(new Date(endDate).getTime()) && new Date(endDate).getTime() < currentTime) &&
    !isCompleted

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-sm',
        isExpired ? 'bg-rose-100 text-rose-700 px-1 py-0.5' : 'text-muted-foreground'
      )}
    >
      <ClockIcon className='size-3' />
      <div className='flex items-center gap-1'>
        {startDate && <p className='text-xs font-semibold text-inherit'>{formatDate(startDate, 'dateMedium')}</p>}
        {startDate && endDate && <p className='text-xs font-semibold text-inherit'>–</p>}
        {endDate && <p className='text-xs font-semibold text-inherit'>{formatDate(endDate, 'dateMedium')}</p>}
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
