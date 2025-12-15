import type { MilestoneColumnDragData } from '@/types/milestone.type'
import type { TaskCardDragData } from '@/types/task.type'
import type { Active, DataRef, Over } from '@dnd-kit/core'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DraggableData = MilestoneColumnDragData | TaskCardDragData

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>
} {
  if (!entry) {
    return false
  }

  const data = entry.data.current

  if (data?.type === 'MilestoneColumn' || data?.type === 'TaskCard') {
    return true
  }

  return false
}
