import AddMilestoneButton from '@/features/milestones/components/add-milestone-button'
import MilestoneColumn from '@/features/milestones/components/milestone-column'
import TaskCard from '@/features/tasks/components/task-card'
import { hasDraggableData } from '@/shared/utils'
import type { Milestone } from '@/types/milestone.type'
import type { Task } from '@/types/task.type'
import {
  defaultKeyboardCoordinateGetter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
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

  const [columns, setColumns] = useState<Milestone[]>(initialColumns)
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const [activeColumn, setActiveColumn] = useState<Milestone | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: defaultKeyboardCoordinateGetter
    })
  )

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return
    const data = event.active.data.current
    if (data?.type === 'MilestoneColumn') {
      setActiveColumn(data.column)
      return
    }

    if (data?.type === 'TaskCard') {
      setActiveTask(data.task)
      return
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (!hasDraggableData(active)) return

    const activeData = active.data.current

    if (activeId === overId) return

    const isActiveAColumn = activeData?.type === 'MilestoneColumn'
    if (!isActiveAColumn) return

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId)

      const overColumnIndex = columns.findIndex((col) => col.id === overId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
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

    const isActiveATask = activeData?.type === 'TaskCard'
    const isOverATask = overData?.type === 'TaskCard'

    if (!isActiveATask) return

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const overIndex = tasks.findIndex((t) => t.id === overId)
        const activeTask = tasks[activeIndex]
        const overTask = tasks[overIndex]
        if (activeTask && overTask && activeTask.milestoneId !== overTask.milestoneId) {
          activeTask.milestoneId = overTask.milestoneId
          return arrayMove(tasks, activeIndex, overIndex - 1)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverAColumn = overData?.type === 'MilestoneColumn'

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const activeTask = tasks[activeIndex]
        if (activeTask) {
          activeTask.milestoneId = overData.column.id
          return arrayMove(tasks, activeIndex, activeIndex)
        }
        return tasks
      })
    }
  }

  return (
    <DndContext
      collisionDetection={customCollisionDetection}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <ProjectContainer>
        <SortableContext items={columnsId}>
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
            tasks={tasks.filter((task) => task.milestoneId === activeColumn.id)}
          />
        )}
        {activeTask && <TaskCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  )
}
