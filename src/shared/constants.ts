import type { Locale } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'

export const DEFAULT_PAGE_INDEX = 1
export const DEFAULT_PAGE_SIZE = 10

export const INITIAL_POSITION = 140737488355328
export const POSITION_GAP = 16384

// tiptap
export const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// project info
export const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_COVER_SIZE = 10 * 1024 * 1024 // 10MB

// user info
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB

// attachments
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB

// task background
export const MAX_BACKGROUND_SIZE = 10 * 1024 * 1024 // 10MB

// TODO: should apply this more on any dates using date-fns
export const DATE_LOCALES: Record<string, Locale> = {
  ['vi-VN']: vi,
  ['en-US']: enUS
}
