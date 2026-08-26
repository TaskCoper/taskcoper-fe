import { sortedTaskLabelColors } from '@/features/projects/labels/constants'
import type { MilestoneColumnDragData, MilestoneTabDragData } from '@/features/projects/milestones/types'
import type { ChildSubtaskDragData, ParentSubtaskDragData } from '@/features/projects/subtasks/types'
import type { TaskCardDragData } from '@/features/projects/tasks/core/types'
import type { Currency } from '@/features/transactions/types'
import type { Me } from '@/features/users/types'
import type { GetPresignedUrlParams } from '@/hooks/use-get-presigned-url'
import type { RoleType } from '@/layouts/role-guard.layout'
import type { BasePaginationResponse } from '@/lib/axios'
import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
import { useMentorWidgetStore } from '@/lib/zustand/mentor-widget.store'
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

const defaultPaginationResponse = {
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

export function getDefaultPaginationResponse<T>(): BasePaginationResponse<T> {
  return defaultPaginationResponse as BasePaginationResponse<T>
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

export const getUserType = (user: Me | null | undefined): RoleType | null => {
  if (!user) return null
  // if (user.role === 'Admin' && !user.organizationId) return 'superAdmin'
  // if (user.role === 'Admin' && user.organizationId) return 'orgAdmin'

  return 'user'
}

export const getRoleHomePath = (userType: RoleType | null): string => {
  if (userType === 'superAdmin') return '/dashboard'
  if (userType === 'orgAdmin') return '/manage'
  return '/projects'
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

export const clearAllUserPreferences = () => {
  useMilestonePreferencesStore.getState().clearAll()
  useMentorWidgetStore.getState().clearAll()
}

export const safeParseJson = <T = Record<string, unknown>>(jsonString: string | null | undefined): Partial<T> => {
  if (!jsonString) return {}
  try {
    return JSON.parse(jsonString) as Partial<T>
  } catch {
    return {}
  }
}

export const getFirstParagraphTextFromHtml = (html: string | null | undefined): string => {
  if (!html) return ''

  try {
    if (typeof DOMParser !== 'undefined') {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const firstParagraph = document.querySelector('p')

      return firstParagraph?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    }
  } catch {
    // fall through to regex-based fallback
  }

  const firstParagraphMatch = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)
  const fallbackContent = firstParagraphMatch?.[1] ?? ''

  return fallbackContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const getPlainTextFromHtml = (value: string | null): string => {
  if (!value) return ''

  try {
    if (typeof DOMParser !== 'undefined') {
      return new DOMParser().parseFromString(value, 'text/html').body.textContent ?? ''
    }
  } catch {
    // Fall back to regex-based stripping below.
  }

  return value.replace(/<[^>]*>/g, ' ')
}

/**
 * Chạy `task` cho từng item nhưng giới hạn số lượng task chạy cùng lúc.
 *
 * - Không vượt quá `limit` task concurrent.
 * - Một item fail không làm dừng các item còn lại.
 * - Kết quả trả về theo đúng thứ tự của `items`.
 * - Mỗi kết quả có format giống `Promise.allSettled`.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  // Tạo sẵn mảng kết quả với cùng số lượng phần tử như `items`.
  // Mỗi worker sẽ ghi kết quả vào đúng index của item tương ứng.
  const results = new Array<PromiseSettledResult<R>>(items.length)

  // Index của item tiếp theo chưa được xử lý.
  // Các worker sẽ cùng dùng cursor này để lấy việc tiếp theo.
  let cursor = 0

  // Mỗi worker liên tục lấy item tiếp theo và xử lý cho tới khi không còn item nào.
  const worker = async () => {
    while (cursor < items.length) {
      // Lấy index hiện tại, sau đó tăng cursor để worker khác có thể lấy item tiếp theo.
      const index = cursor++

      try {
        // Chạy task cho item hiện tại.
        // Nếu thành công, lưu kết quả vào đúng vị trí ban đầu.
        results[index] = {
          status: 'fulfilled',
          value: await task(items[index], index)
        }
      } catch (reason) {
        // Nếu task fail, lưu lỗi lại thay vì throw,
        // để worker tiếp tục xử lý các item còn lại.
        results[index] = {
          status: 'rejected',
          reason
        }
      }
    }
  }

  // Số worker tối đa bằng `limit`, nhưng không cần nhiều worker hơn số lượng item.
  // Math.max(1, ...) đảm bảo luôn tạo ít nhất 1 worker.
  const workerCount = Math.max(1, Math.min(limit, items.length))

  // Chạy tất cả worker song song.
  // Mỗi worker tự lấy item tiếp theo thông qua `cursor`.
  await Promise.all(Array.from({ length: workerCount }, worker))

  // Trả về kết quả theo đúng thứ tự của `items`.
  return results
}
