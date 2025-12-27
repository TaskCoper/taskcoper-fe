import type { BasePaginationResponse } from '@/lib/axios'
import type { MilestoneColumnDragData } from '@/types/milestone.type'
import type { TaskCardDragData } from '@/types/task.type'
import type { Active, DataRef, Over } from '@dnd-kit/core'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, INITIAL_POSITION, POSITION_INCREMENT } from './constants'

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

export function getDefaultPaginationResponse<T>(): BasePaginationResponse<T> {
  return {
    value: {
      items: [],
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    error: {
      code: '',
      message: ''
    },
    isSuccess: true,
    isFailure: false
  }
}

/**
 * Calculate position for a new parent milestone
 * - First milestone ever: 16384
 * - Adding at the end: last position + 65536
 */
export const calculatePosition = (existingItems: Array<{ position: number }>): number => {
  if (existingItems.length === 0) {
    return INITIAL_POSITION
  }

  // Sort by position to get the last one
  const sortedMilestones = [...existingItems].sort((a, b) => a.position - b.position)
  const lastPosition = sortedMilestones[sortedMilestones.length - 1].position

  // Add at the end: last position + increment
  const newPosition = lastPosition + POSITION_INCREMENT

  // Round to 5 decimal places
  return Math.round(newPosition * 100000) / 100000
}
