import { sortedTaskLabelColors } from '@/features/labels/constants'
import type { GetPresignedUrlParams } from '@/hooks/use-get-presigned-url'
import type { RoleType } from '@/layouts/role-guard.layout'
import type { BasePaginationResponse } from '@/lib/axios'
import type { UserPayload } from '@/lib/zustand/auth.store'
import type { MilestoneColumnDragData, MilestoneTabDragData } from '@/types/milestone.type'
import type { ChildSubtaskDragData, ParentSubtaskDragData } from '@/types/subtask.type'
import type { TaskCardDragData } from '@/types/task.type'
import type { Currency } from '@/types/transaction.type'
import type { Active, DataRef, Over } from '@dnd-kit/core'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, INITIAL_POSITION, POSITION_GAP } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DraggableData =
  | MilestoneColumnDragData
  | TaskCardDragData
  | MilestoneTabDragData
  | ParentSubtaskDragData
  | ChildSubtaskDragData

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>
} {
  if (!entry) {
    return false
  }

  const data = entry.data.current

  if (
    data?.type === 'MilestoneColumn' ||
    data?.type === 'TaskCard' ||
    data?.type === 'MilestoneTab' ||
    data?.type === 'ParentSubtask' ||
    data?.type === 'ChildSubtask'
  ) {
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

export const getColorTextClass = (color: string) => {
  return (
    sortedTaskLabelColors.flatMap((col) => col.shades).find((shade) => shade.value === color)?.textColor ||
    'text-foreground'
  )
}

export const formatDate = (date: Date | string | number | undefined, opts: Intl.DateTimeFormatOptions = {}) => {
  if (!date) return ''

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date))
  } catch {
    return ''
  }
}

export const getUserType = (user: UserPayload | null): RoleType | null => {
  if (!user) return null
  if (user.Role === 'Admin' && !user.OrganizationId) return 'superAdmin'
  if (user.Role === 'Admin' && user.OrganizationId) return 'orgAdmin'

  return 'user'
}

export const formatCurrency = (price: number, currency?: Currency) => {
  const currencyCode = currency === 'Usd' ? 'USD' : 'VND'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price)
  } catch {
    return `${price.toLocaleString()} ${currency}`
  }
}

export const getTimezoneOffsetString = () => {
  const date = new Date()
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const gmt = `GMT${sign}${String(hours).padStart(2, '0')}`

  return minutes > 0 ? `${gmt}:${String(minutes).padStart(2, '0')}` : gmt
}
