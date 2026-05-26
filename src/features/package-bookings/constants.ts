import { CheckCircle2Icon, Clock3Icon, PackageCheckIcon, XCircleIcon, type LucideIcon } from 'lucide-react'
import { PackageRequestStatus } from './types'

export type PackageRequestStatusTheme = {
  icon: LucideIcon
  className: string
}

export const PACKAGE_REQUEST_STATUS_THEME: Record<PackageRequestStatus, PackageRequestStatusTheme> = {
  [PackageRequestStatus.Pending]: {
    icon: Clock3Icon,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  [PackageRequestStatus.Approved]: {
    icon: CheckCircle2Icon,
    className: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  [PackageRequestStatus.Rejected]: {
    icon: XCircleIcon,
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  },
  [PackageRequestStatus.Consumed]: {
    icon: PackageCheckIcon,
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20'
  },
  [PackageRequestStatus.Cancelled]: {
    icon: XCircleIcon,
    className: 'bg-muted text-muted-foreground border-muted/20'
  }
}

export const PACKAGE_REQUEST_STATUS_BADGE_THEME: Record<PackageRequestStatus, PackageRequestStatusTheme> = {
  [PackageRequestStatus.Pending]: {
    icon: Clock3Icon,
    className: 'bg-amber-50 text-amber-700 border-amber-200/50'
  },
  [PackageRequestStatus.Approved]: {
    icon: CheckCircle2Icon,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
  },
  [PackageRequestStatus.Rejected]: {
    icon: XCircleIcon,
    className: 'bg-rose-50 text-rose-700 border-rose-200/50'
  },
  [PackageRequestStatus.Consumed]: {
    icon: PackageCheckIcon,
    className: 'bg-sky-50 text-sky-700 border-sky-200/50'
  },
  [PackageRequestStatus.Cancelled]: {
    icon: XCircleIcon,
    className: 'bg-muted text-muted-foreground border-muted/50'
  }
}

export const PACKAGE_REQUEST_STATUS_SOLID_THEME: Record<PackageRequestStatus, PackageRequestStatusTheme> = {
  [PackageRequestStatus.Pending]: {
    icon: Clock3Icon,
    className: 'bg-amber-500 text-white border-amber-500'
  },
  [PackageRequestStatus.Approved]: {
    icon: CheckCircle2Icon,
    className: 'bg-emerald-600 text-white border-emerald-600'
  },
  [PackageRequestStatus.Rejected]: {
    icon: XCircleIcon,
    className: 'bg-rose-600 text-white border-rose-600'
  },
  [PackageRequestStatus.Consumed]: {
    icon: PackageCheckIcon,
    className: 'bg-sky-600 text-white border-sky-600'
  },
  [PackageRequestStatus.Cancelled]: {
    icon: XCircleIcon,
    className: 'bg-muted text-white border-muted'
  }
}
