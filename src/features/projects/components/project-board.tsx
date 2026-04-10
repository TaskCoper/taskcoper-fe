import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import AddMilestoneButton from '@/features/milestones/components/add-milestone-button'
import SortableMilestoneColumn from '@/features/milestones/components/sortable-milestone-column'
import { useUpdateMilestone } from '@/features/milestones/hooks/use-update-milestone'
import { updateMilestoneSchema } from '@/features/milestones/validations'
import SortableTaskCard from '@/features/tasks/components/sortable-task-card'
import { useMoveTask } from '@/features/tasks/hooks/use-move-task'
import { moveTaskSchema } from '@/features/tasks/validations'
import { queryKeys } from '@/lib/query-keys'
import { calculateReorderPosition, hasDraggableData } from '@/shared/utils'
import type { Milestone, MilestoneWithTasks } from '@/types/milestone.type'
import type { TaskPreview } from '@/types/task.type'
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetMyProjectPermissions } from '../hooks/use-get-my-project-permissions'
import ProjectContainer from './project-container'

interface ProjectBoardProps {
  initialColumns: Milestone[]
  initialTasks: TaskPreview[]
}

export default function ProjectBoard({ initialColumns, initialTasks }: ProjectBoardProps) {
  const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const queryKey = queryKeys.milestones.byParent(identifier, milestoneIdentifier)

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canMoveTask = check('TASKS', 'canUpdate', 'canMoveTask')
  const canMoveMilestone = check('TASKS', 'canUpdate', 'canMoveMilestone')

  const columnsId = useMemo(() => initialColumns.map((col) => col.id), [initialColumns])

  const [activeColumn, setActiveColumn] = useState<Milestone | null>(null)
  const [activeTask, setActiveTask] = useState<TaskPreview | null>(null)

  const { updateMilestone } = useUpdateMilestone()
  const { moveTask } = useMoveTask({
    projectIdentifier: identifier,
    milestoneIdentifier,
    milestoneId: activeTask?.milestoneId,
    taskIdentifier: activeTask?.slug
  })

  const sensors = useDndSensors()

  // set active column or task for overlay
  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return
    const data = event.active.data.current

    if (data?.type === 'MilestoneColumn') {
      setActiveColumn(data.column)
      return
    }

    if (data?.type === 'TaskCard') {
      setActiveTask({ ...data.task })
      return
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    if (!hasDraggableData(active) || !hasDraggableData(over)) return

    const activeData = active.data.current
    const overData = over.data.current

    const isActiveAColumn = activeData?.type === 'MilestoneColumn'
    const isOverAColumn = overData?.type === 'MilestoneColumn'
    const isActiveATask = activeData?.type === 'TaskCard'
    const isOverATask = overData?.type === 'TaskCard'

    // dragging column over column
    if (isActiveAColumn && isOverAColumn) {
      queryClient.setQueryData(queryKey, (old: MilestoneWithTasks) => {
        if (!old) return old
        const activeIndex = old.milestones.findIndex((col) => col.id === activeId)
        const overIndex = old.milestones.findIndex((col) => col.id === overId)

        return {
          ...old,
          milestones: arrayMove(old.milestones, activeIndex, overIndex)
        }
      })
    }

    if (!isActiveATask) return

    // dragging task over task
    if (isActiveATask && isOverATask) {
      queryClient.setQueryData(queryKey, (old: MilestoneWithTasks) => {
        if (!old) return old
        const newTasks = [...old.tasks]
        const activeIndex = newTasks.findIndex((t) => t.id === activeId)
        const overIndex = newTasks.findIndex((t) => t.id === overId)

        const activeTask = newTasks[activeIndex]
        const overTask = newTasks[overIndex]

        // move a task between columns
        if (activeTask && overTask && activeTask.milestoneId !== overTask.milestoneId) {
          newTasks[activeIndex] = { ...activeTask, milestoneId: overTask.milestoneId }
          return { ...old, tasks: arrayMove(newTasks, activeIndex, overIndex - 1) }
        }

        // reorder task within the same column
        return { ...old, tasks: arrayMove(newTasks, activeIndex, overIndex) }
      })
    }

    // dragging task over an empty column
    if (isActiveATask && isOverAColumn) {
      queryClient.setQueryData(queryKey, (old: MilestoneWithTasks) => {
        if (!old) return old
        const newTasks = [...old.tasks]
        const activeIndex = newTasks.findIndex((t) => t.id === activeId)

        if (activeIndex !== -1) {
          newTasks[activeIndex] = { ...newTasks[activeIndex], milestoneId: overData.column.id }
          return { ...old, tasks: newTasks }
        }
        return old
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    const originalColumn = activeColumn
    const originalTask = activeTask

    if (!over) return

    const activeId = active.id
    const activeData = active.data.current
    let newPosition = 0

    if (activeData?.type === 'MilestoneColumn' && originalColumn) {
      if (!canMoveMilestone) return

      const currentIndex = initialColumns.findIndex((col) => col.id === activeId)
      newPosition = calculateReorderPosition(initialColumns, currentIndex)

      // if the new position is the same as the original position, return
      if (originalColumn.position === newPosition) {
        return
      }

      queryClient.setQueryData(queryKey, (old: MilestoneWithTasks) => {
        if (!old) return old
        const newMilestones = [...old.milestones]
        newMilestones[currentIndex] = { ...newMilestones[currentIndex], position: newPosition }
        return { ...old, milestones: newMilestones }
      })

      const validated = updateMilestoneSchema(t).safeParse({
        milestoneId: activeId,
        parentMilestoneIdentifier: milestoneIdentifier,
        milestoneName: activeData.column.name,
        position: newPosition
      })

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
      return
    }

    if (activeData?.type === 'TaskCard' && originalTask) {
      if (!canMoveTask) return

      const tasksClone = [...initialTasks]
      const activeIndex = tasksClone.findIndex((t) => t.id === activeId)
      const currentTask = tasksClone[activeIndex]

      const columnTasks = tasksClone.filter((t) => t.milestoneId === currentTask.milestoneId)
      const indexInColumn = columnTasks.findIndex((t) => t.id === activeId)

      newPosition = calculateReorderPosition(columnTasks, indexInColumn)

      // if the new position is the same as the original position and the milestone id is the same as the original milestone id, return
      if (originalTask.position === newPosition && originalTask.milestoneId === currentTask.milestoneId) {
        return
      }

      queryClient.setQueryData(queryKey, (old: MilestoneWithTasks) => {
        if (!old) return old
        const newTasks = [...old.tasks]
        newTasks[activeIndex] = { ...currentTask, position: newPosition }
        return { ...old, tasks: newTasks }
      })

      const validated = moveTaskSchema(t).safeParse({
        id: activeId,
        targetMilestoneId: currentTask.milestoneId,
        targetPosition: newPosition
      })

      if (validated.success) {
        moveTask(
          { body: validated.data },
          {
            onSettled: () => {
              setActiveColumn(null)
              setActiveTask(null)
            }
          }
        )
      }
    }

    newPosition = 0
  }

  return (
    <DndContext
      collisionDetection={customCollisionDetection}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <ProjectContainer>
        <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
          {initialColumns.length > 0 && (
            <div className='flex items-start gap-3'>
              {initialColumns.map((col) => (
                <SortableMilestoneColumn
                  key={col.id}
                  column={col}
                  tasks={initialTasks.filter((task) => task.milestoneId === col.id)}
                  queryKey={queryKey}
                  canMoveMilestone={canMoveMilestone}
                  canMoveTask={canMoveTask}
                />
              ))}
            </div>
          )}
        </SortableContext>
        {identifier && milestoneIdentifier ? (
          <AddMilestoneButton projectIdentifier={identifier} parentMilestoneIdentifier={milestoneIdentifier} />
        ) : null}
      </ProjectContainer>

      <DragOverlay>
        {activeColumn && (
          <SortableMilestoneColumn
            isOverlay
            column={activeColumn}
            tasks={initialTasks.filter((task) => task.milestoneId === activeColumn.id)}
            queryKey={queryKey}
          />
        )}
        {activeTask && <SortableTaskCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  )
}
