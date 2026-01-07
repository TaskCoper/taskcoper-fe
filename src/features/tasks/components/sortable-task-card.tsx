import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, getAvatarFallback } from '@/shared/utils'
import type { TaskCardDragData, TaskMember, TaskPreview } from '@/types/task.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CircleCheckBigIcon, ClockIcon, MessageSquareIcon, PaperclipIcon, SquarePenIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

interface SortableTaskCardProps {
  task: TaskPreview
  isOverlay?: boolean
}

export default function SortableTaskCard({ task, isOverlay }: SortableTaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'TaskCard',
      task
    } satisfies TaskCardDragData,
    attributes: {
      roleDescription: 'Task'
    }
  })

  const isCompleted = false

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'opacity-50',
        overlay: 'ring-2 ring-primary'
      }
    }
  })

  const isDisplayIcons =
    task.startDate ||
    task.endDate ||
    task.totalComments > 0 ||
    task.completedSubtasks > 0 ||
    task.members.length > 0 ||
    task.progressPercentage > 0 ||
    task.totalResources > 0 ||
    task.totalSubtasks > 0

  return (
    <Link to={`tasks/${task.id}`}>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
          className:
            'gap-1 p-3 border-none rounded-md cursor-pointer hover:ring-2 hover:ring-primary relative group overflow-hidden'
        })}
      >
        <SquarePenIcon className='size-3.5 absolute right-2 top-2 hidden group-hover:block' />
        <div className='flex items-start gap-2'>
          <Checkbox
            className={cn(
              'rounded-full border-foreground mt-0.5',
              isCompleted
                ? 'data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600'
                : 'hidden group-hover:block'
            )}
            checked={isCompleted}
            onCheckedChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
          <p className={cn('text-sm w-[80%]', isCompleted ? 'text-muted-foreground' : '')}>{task.name}</p>
        </div>

        {isDisplayIcons ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-4 gap-y-2 mt-1',
              task.progressPercentage > 0 ? 'mb-1' : ''
            )}
          >
            {task.startDate || task.endDate ? <TaskDateChip startDate={task.startDate} endDate={task.endDate} /> : null}
            {task.totalSubtasks > 0 ? (
              <TaskSubtasksChip completedSubtasks={task.completedSubtasks} totalSubtasks={task.totalSubtasks} />
            ) : null}
            {task.totalComments > 0 ? <TaskCommentChip commentCount={task.totalComments} /> : null}
            {task.totalResources > 0 ? <TaskAttachmentChip totalResources={task.totalResources} /> : null}
            {task.members.length > 0 ? (
              <div className='ml-auto'>
                <TaskMembersChip members={task.members} />
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
      </Card>
    </Link>
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
        {endDate && <p className='text-xs font-semibold text-muted-foreground'>–</p>}
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
        <Tooltip key={member.userId}>
          <TooltipTrigger asChild>
            <Avatar
              className={cn('size-4', `transition-transform ${activeIndex === index ? 'z-10 scale-110' : ''}`)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <AvatarImage src={member.avatar || ''} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback className='text-[10px]'>
                {getAvatarFallback(`${member.firstName} ${member.lastName}`)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p className='font-medium'>{`${member.firstName} ${member.lastName}`}</p>
            <p className='text-xs text-muted-foreground'>{member.email}</p>
          </TooltipContent>
        </Tooltip>
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
