import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { INITIAL_POSITION, POSITION_GAP } from '@/shared/constants'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetChildMilestones } from '../../../milestones/hooks/use-get-child-milestones'
import { useGetMilestoneTasks } from '../../../milestones/hooks/use-get-milestone-tasks'
import { useMoveTask } from '../hooks/use-move-task'
import { moveTaskSchema } from '../validations'

interface MoveTaskPopoverProps {
  children: React.ReactNode
  projectIdentifier: string
  milestoneIdentifier: string
  milestoneId: string
  taskId: string
  taskIdentifier: string
}

export default function MoveTaskPopover({
  children,
  projectIdentifier,
  milestoneIdentifier,
  milestoneId,
  taskId,
  taskIdentifier
}: MoveTaskPopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestoneId)

  const [prevSelectedMilestoneId, setPrevSelectedMilestoneId] = useState(selectedMilestoneId)
  const [userSelectedPosition, setUserSelectedPosition] = useState<string | null>(null)

  const { moveTask, isMovingTask } = useMoveTask({
    isDragging: false,
    projectIdentifier,
    milestoneIdentifier,
    milestoneId,
    taskIdentifier,
    targetMilestoneId: selectedMilestoneId
  })
  const { childMilestones, isLoadingChildMilestones } = useGetChildMilestones({
    parentMilestoneIdentifier: milestoneIdentifier,
    enabled: open
  })
  const { tasks, isLoadingTasks } = useGetMilestoneTasks({ milestoneId: selectedMilestoneId, enabled: open })

  const taskCount = tasks?.value.items.length ?? 0
  const isSameMilestone = selectedMilestoneId === milestoneId
  const maxPosition = isSameMilestone ? taskCount : taskCount + 1
  const taskPositions = Array.from({ length: maxPosition }, (_, index) => index + 1)

  const taskIndex = tasks?.value.items.findIndex((task) => task.id === taskId) ?? -1
  const currentTaskPosition = taskIndex !== -1 ? taskIndex + 1 : -1

  if (selectedMilestoneId !== prevSelectedMilestoneId) {
    setPrevSelectedMilestoneId(selectedMilestoneId)
    setUserSelectedPosition(null)
  }

  const defaultPosition =
    selectedMilestoneId === milestoneId && currentTaskPosition !== -1 ? currentTaskPosition : taskCount + 1

  const selectedPosition = userSelectedPosition ?? defaultPosition.toString()

  const handleMoveTask = () => {
    if (!tasks) return

    if (selectedMilestoneId === milestoneId && Number(selectedPosition) === currentTaskPosition) {
      setOpen(false)
      return
    }

    const targetIndex = Number(selectedPosition) - 1
    const targetTasks = tasks.value.items || []

    const cleanList = targetTasks.filter((t) => t.id !== taskId)
    const prevItem = cleanList[targetIndex - 1]
    const nextItem = cleanList[targetIndex]

    let newPosition: number

    if (!prevItem && nextItem) {
      newPosition = nextItem.position - POSITION_GAP
    } else if (prevItem && !nextItem) {
      newPosition = prevItem.position + POSITION_GAP
    } else if (prevItem && nextItem) {
      newPosition = (prevItem.position + nextItem.position) / 2
    } else {
      newPosition = INITIAL_POSITION
    }

    if ((prevItem && newPosition === prevItem.position) || (nextItem && newPosition === nextItem.position)) {
      newPosition = prevItem.position + 0.0000000001
    }

    const result = moveTaskSchema(t).safeParse({
      id: taskId,
      targetMilestoneId: selectedMilestoneId,
      targetPosition: newPosition
    })

    if (result.success) {
      moveTask(
        {
          body: {
            id: taskId,
            targetMilestoneId: selectedMilestoneId,
            targetPosition: newPosition
          }
        },
        {
          onSuccess: () => {
            setOpen(false)
          }
        }
      )
    }
  }

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedMilestoneId(milestoneId)
      setUserSelectedPosition(null)
    }
  }

  const onClose = () => {
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto w-80'
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.moveTask.title')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={onClose} />
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <Select
                value={selectedMilestoneId}
                onValueChange={setSelectedMilestoneId}
                disabled={isLoadingChildMilestones}
              >
                <SelectTrigger className='w-3/4'>
                  <SelectValue placeholder={t('task.moveTask.selectMilestone')} />
                </SelectTrigger>
                <SelectContent className='min-w-(--radix-select-trigger-width)'>
                  {childMilestones?.value.items.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPosition} onValueChange={setUserSelectedPosition} disabled={isLoadingTasks}>
                <SelectTrigger className='w-1/4'>
                  <SelectValue placeholder={t('task.moveTask.selectPosition')} />
                </SelectTrigger>
                <SelectContent className='min-w-(--radix-select-trigger-width)'>
                  {taskPositions.map((position) => (
                    <SelectItem key={position} value={position.toString()}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className='ml-auto' onClick={handleMoveTask} disabled={isMovingTask}>
              {isMovingTask ? <Spinner /> : null}
              {t('task.moveTask.move')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
