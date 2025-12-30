import AddMilestoneButton from '@/features/milestones/components/add-milestone-button'
import MilestoneColumn from '@/features/milestones/components/milestone-column'
import { useMoveMilestone } from '@/features/milestones/hooks/use-move-milestone'
import { moveMilestoneSchema } from '@/features/milestones/validations'
import TaskCard from '@/features/tasks/components/task-card'
import { useMoveTask } from '@/features/tasks/hooks/use-move-task'
import { moveTaskSchema } from '@/features/tasks/validations'
import { calculateReorderPosition, hasDraggableData } from '@/shared/utils'
import type { Milestone, MilestoneWithTasks } from '@/types/milestone.type'
import type { Task } from '@/types/task.type'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  defaultKeyboardCoordinateGetter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import ProjectContainer from './project-container'

interface ProjectBoardProps {
  initialColumns: Milestone[]
  initialTasks: Task[]
}

const customCollisionDetection: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args)

  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }

  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args)
}

export default function ProjectBoard({ initialColumns, initialTasks }: ProjectBoardProps) {
  const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()
  const queryClient = useQueryClient()
  const queryKey = ['milestones', projectId, milestoneId]

  const columnsId = useMemo(() => initialColumns.map((col) => col.id), [initialColumns])

  const [activeColumn, setActiveColumn] = useState<Milestone | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const { moveMilestone } = useMoveMilestone()
  const { moveTask } = useMoveTask()

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter })
  )

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

    setActiveColumn(null)
    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const activeData = active.data.current
    let newPosition = 0

    if (activeData?.type === 'MilestoneColumn' && originalColumn) {
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

      const validated = moveMilestoneSchema.safeParse({
        milestoneId: activeId,
        parentId: milestoneId,
        milestoneName: activeData.column.name,
        position: newPosition
      })

      if (validated.success) {
        moveMilestone({ body: validated.data })
      }
      return
    }

    if (activeData?.type === 'TaskCard' && originalTask) {
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

      const validated = moveTaskSchema.safeParse({
        id: activeId,
        targetMilestoneId: currentTask.milestoneId,
        targetPosition: newPosition
      })

      if (validated.success) {
        moveTask({ body: validated.data })
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
                <MilestoneColumn
                  key={col.id}
                  column={col}
                  tasks={initialTasks.filter((task) => task.milestoneId === col.id)}
                />
              ))}
            </div>
          )}
        </SortableContext>
        {projectId && milestoneId ? <AddMilestoneButton projectId={projectId} parentId={milestoneId} /> : null}
      </ProjectContainer>

      <DragOverlay>
        {activeColumn && (
          <MilestoneColumn
            isOverlay
            column={activeColumn}
            tasks={initialTasks.filter((task) => task.milestoneId === activeColumn.id)}
          />
        )}
        {activeTask && <TaskCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  )
}
