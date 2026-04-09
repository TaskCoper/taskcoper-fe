/* eslint-disable react-hooks/set-state-in-effect */
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useGetChildMilestones } from '@/features/milestones/hooks/use-get-child-milestones'
import { useGetMilestoneTasks } from '@/features/milestones/hooks/use-get-milestone-tasks'
import { useGetParentMilestones } from '@/features/milestones/hooks/use-get-parent-milestones'
import { INITIAL_POSITION, POSITION_GAP } from '@/shared/constants'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMoveTask } from '../hooks/use-move-task'
import { moveTaskSchema } from '../validations'

interface MoveTaskPopoverV2Props {
  children: React.ReactNode
  projectIdentifier: string
  taskParentMilestoneSlug: string
  taskMilestoneId: string
  taskIdentifier: string
  taskId: string
}

export default function MoveTaskPopoverV2({
  children,
  projectIdentifier,
  taskParentMilestoneSlug,
  taskMilestoneId,
  taskIdentifier,
  taskId
}: MoveTaskPopoverV2Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const [selectedParentSlug, setSelectedParentSlug] = useState<string | undefined>(taskParentMilestoneSlug)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | undefined>(taskMilestoneId)
  const [position, setPosition] = useState<string | undefined>(undefined)

  const { parentMilestones, isLoadingParentMilestones } = useGetParentMilestones({
    identifier: projectIdentifier,
    enabled: open
  })

  const { childMilestones, isLoadingChildMilestones } = useGetChildMilestones({
    parentMilestoneIdentifier: selectedParentSlug,
    enabled: open
  })

  const { tasks, isLoadingTasks } = useGetMilestoneTasks({
    milestoneId: selectedMilestoneId,
    enabled: open
  })

  const { moveTask, isMovingTask } = useMoveTask({
    isDragging: false,
    projectIdentifier,
    milestoneId: taskMilestoneId,
    taskIdentifier,
    targetMilestoneId: selectedMilestoneId,
    currentMilestoneIdentifier: taskParentMilestoneSlug,
    targetMilestoneIdentifier: selectedParentSlug
  })

  const taskItems = tasks?.value.items ?? []
  const taskCount = tasks?.value.totalCount ?? 0
  const isSameMilestone = selectedMilestoneId === taskMilestoneId
  const currentTaskIndex = taskItems.findIndex((t) => t.id === taskId)
  const hasChildMilestones = (childMilestones?.value.items.length ?? 0) > 0

  // when parent milestone changes
  useEffect(() => {
    if (!open) return

    // if user select new parent milestone, auto select the first milestone in the new parent
    if (selectedParentSlug !== taskParentMilestoneSlug) {
      if (childMilestones?.value.items.length) {
        setSelectedMilestoneId(childMilestones.value.items[0].id)
      } else {
        setSelectedMilestoneId(undefined)
        setPosition(undefined)
      }
    } else {
      // else keep the original milestone
      setSelectedMilestoneId(taskMilestoneId)
    }
  }, [selectedParentSlug, taskParentMilestoneSlug, childMilestones, taskMilestoneId, open])

  // when child milestone changes
  useEffect(() => {
    if (!open || isLoadingTasks) return
    if (!selectedMilestoneId) {
      setPosition(undefined)
      return
    }

    if (!isSameMilestone) {
      // if the new milestone is not the same as the original milestone take the last position
      setPosition((taskCount + 1).toString())
    } else if (currentTaskIndex !== -1) {
      // else take the original position
      setPosition((currentTaskIndex + 1).toString())
    }
  }, [selectedMilestoneId, isSameMilestone, taskCount, currentTaskIndex, isLoadingTasks, open])

  const maxPosition = isSameMilestone ? taskCount : taskCount + 1
  const positions = Array.from({ length: maxPosition }, (_, index) => index + 1)

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setSelectedParentSlug(taskParentMilestoneSlug)
      setSelectedMilestoneId(taskMilestoneId)
      setPosition(undefined)
    }
  }

  const onMoveTask = () => {
    if (!tasks || !position) return

    const targetPos = parseInt(position)
    if (isSameMilestone && targetPos === currentTaskIndex + 1) {
      setOpen(false)
      return
    }

    const targetIndex = targetPos - 1
    const cleanList = taskItems.filter((t) => t.id !== taskId)
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
      newPosition = (prevItem?.position ?? 0) + 0.0000000001
    }

    const validation = moveTaskSchema(t).safeParse({
      id: taskId,
      targetMilestoneId: selectedMilestoneId,
      targetPosition: newPosition
    })

    if (validation.success) {
      moveTask(
        { body: validation.data },
        {
          onSuccess: () => setOpen(false)
        }
      )
    }
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
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={() => setOpen(false)} />
          </div>

          <div className='flex flex-col gap-4'>
            <div className='space-y-4'>
              <Field className='gap-0.5'>
                <FieldLabel htmlFor='parent-milestone-select' className='font-semibold text-xs text-muted-foreground'>
                  {t('task.moveTask.tabLabel')}
                </FieldLabel>
                <Select
                  value={selectedParentSlug}
                  onValueChange={setSelectedParentSlug}
                  disabled={isLoadingParentMilestones}
                >
                  <SelectTrigger className='w-full' id='parent-milestone-select'>
                    <SelectValue placeholder={t('task.moveTask.selectMilestone')} />
                  </SelectTrigger>
                  <SelectContent className='min-w-(--radix-select-trigger-width)'>
                    {parentMilestones?.value.items.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.slug}>
                        {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className='gap-0.5'>
                <FieldLabel htmlFor='child-milestone-select' className='font-semibold text-xs text-muted-foreground'>
                  {t('task.moveTask.milestoneLabel')}
                </FieldLabel>
                <Select
                  value={selectedMilestoneId}
                  onValueChange={setSelectedMilestoneId}
                  disabled={isLoadingChildMilestones || !hasChildMilestones}
                >
                  <SelectTrigger id='child-milestone-select'>
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
              </Field>

              <Field className='gap-0.5'>
                <FieldLabel htmlFor='position-select' className='font-semibold text-xs text-muted-foreground'>
                  {t('task.moveTask.positionLabel')}
                </FieldLabel>
                <Select
                  value={position}
                  onValueChange={setPosition}
                  disabled={isLoadingTasks || !hasChildMilestones || !selectedMilestoneId}
                >
                  <SelectTrigger id='position-select'>
                    <SelectValue placeholder={t('task.moveTask.selectPosition')} />
                  </SelectTrigger>
                  <SelectContent className='min-w-(--radix-select-trigger-width)'>
                    {positions.map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Button className='ml-auto' onClick={onMoveTask} disabled={isMovingTask}>
              {isMovingTask && <Spinner />}
              {t('task.moveTask.move')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
