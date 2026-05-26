import { ApplicationStatus } from '@/features/mentor-applications/types'
import { AlertCircleIcon, BriefcaseIcon, CheckCircle2Icon, ClockIcon, EyeIcon } from 'lucide-react'

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

export const UNDERLINE_TAB_CLASSNAME = {
  TabList:
    'inline-flex h-9 items-center text-muted-foreground w-full justify-start rounded-none border-b bg-transparent p-0',
  TabTrigger:
    'inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'
}

export const DAY_OF_WEEKS = [
  { id: 1, value: 1, key: 'monday' },
  { id: 50, value: 2, key: 'tuesday' },
  { id: 100, value: 3, key: 'wednesday' },
  { id: 150, value: 4, key: 'thursday' },
  { id: 200, value: 5, key: 'friday' },
  { id: 250, value: 6, key: 'saturday' },
  { id: 300, value: 0, key: 'sunday' }
] as const

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { labelKey: string; icon: React.ElementType; className: string }
> = {
  [ApplicationStatus.PENDING]: {
    labelKey: 'mentorApplication.status.pending',
    icon: ClockIcon,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  [ApplicationStatus.IN_REVIEW]: {
    labelKey: 'mentorApplication.status.inReview',
    icon: EyeIcon,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  [ApplicationStatus.IN_OFFERS]: {
    labelKey: 'mentorApplication.status.inOffers',
    icon: BriefcaseIcon,
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  [ApplicationStatus.APPROVED]: {
    labelKey: 'mentorApplication.status.approved',
    icon: CheckCircle2Icon,
    className: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  [ApplicationStatus.REJECTED]: {
    labelKey: 'mentorApplication.status.rejected',
    icon: AlertCircleIcon,
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  }
}
