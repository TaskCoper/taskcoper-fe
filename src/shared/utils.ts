import type { GetPresignedUrlParams } from '@/hooks/use-get-presigned-url'
import type { BasePaginationResponse } from '@/lib/axios'
import type { MilestoneColumnDragData, MilestoneTabDragData } from '@/types/milestone.type'
import type { TaskCardDragData } from '@/types/task.type'
import type { Active, DataRef, Over } from '@dnd-kit/core'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, INITIAL_POSITION, POSITION_GAP } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DraggableData = MilestoneColumnDragData | TaskCardDragData | MilestoneTabDragData

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>
} {
  if (!entry) {
    return false
  }

  const data = entry.data.current

  if (data?.type === 'MilestoneColumn' || data?.type === 'TaskCard' || data?.type === 'MilestoneTab') {
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
 * Calculate position for a new item
 * - First item ever: INITIAL_POSITION
 * - Adding at the end: last position + POSITION_GAP
 */
export const calculateNewItemPosition = (existingItems: Array<{ position: number }>): number => {
  if (existingItems.length === 0) {
    return INITIAL_POSITION
  }

  const sortedMilestones = [...existingItems].sort((a, b) => a.position - b.position)
  const lastPosition = sortedMilestones[sortedMilestones.length - 1].position

  const newPosition = lastPosition + POSITION_GAP

  return Math.round(newPosition * 100000) / 100000
}

/**
 * Calculate position for a reordered item
 * - If the item is the first one: next item's position - POSITION_GAP
 * - If the item is the last one: prev item's position + POSITION_GAP
 * - If the item is in the middle: (prev + next) / 2
 * - If the item is the only one: INITIAL_POSITION
 */
export const calculateReorderPosition = (items: { position: number }[], newIndex: number): number => {
  const prevItem = items[newIndex - 1]
  const nextItem = items[newIndex + 1]

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
    alert('Need to rebalance positions.')
    return prevItem.position + 0.0000000001
  }

  return newPosition
}

/**
 * Generates a clean, unique key and identifies the content type
 */
export const prepareFileUpload = (file: File, folder: string = 'general'): GetPresignedUrlParams => {
  const extension = file.name.split('.').pop()

  const nameSlug = file.name
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')

  const uniqueId = Math.random().toString(36).substring(2, 8)

  const key = `${folder}/${uniqueId}-${nameSlug}.${extension}`

  return {
    key,
    contentType: file.type || 'application/octet-stream'
  }
}

export const getAvatarFallback = (fullName: string) =>
  fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
