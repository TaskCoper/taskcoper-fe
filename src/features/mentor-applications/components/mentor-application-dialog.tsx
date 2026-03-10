import SanitizedHtml from '@/components/sanitized-html'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Application } from '@/types/mentor-application.type'
import { ApplicationStatus } from '@/types/mentor-application.type'
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface MentorApplicationDialogProps {
  children: React.ReactNode
  application: Application
}

const STATUS_CONFIG = {
  [ApplicationStatus.PENDING]: {
    labelKey: 'mentorApplication.status.pendingReview',
    icon: ClockIcon,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
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

function SectionLabel({ label }: { label: string }) {
  return <p className='text-sm font-medium text-muted-foreground mb-2'>{label}</p>
}

export default function MentorApplicationDialog({ application, children }: MentorApplicationDialogProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const config = STATUS_CONFIG[application.status]
  const StatusIcon = config.icon

  const dateFormatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  const submittedDate = new Date(application.createdOnUtc).toLocaleDateString(i18n.language, dateFormatOptions)

  const reviewedDate = application.reviewedAt
    ? new Date(application.reviewedAt).toLocaleDateString(i18n.language, dateFormatOptions)
    : null

  const fileNames = (application.portfolioUrls ?? []).map((url) => {
    const raw = url.split('/').pop() ?? url
    return raw.replace(/^[a-z0-9]+-/, '')
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        position='top-center'
        className='min-w-4xl flex flex-col p-0 gap-0 overflow-hidden'
        onInteractOutside={() => setOpen(false)}
        showCloseButton={false}
      >
        <DialogHeader className='p-4 gap-0'>
          <div className='flex items-start justify-between gap-3'>
            <DialogTitle>{t('mentorApplication.dialog.title')}</DialogTitle>

            <p
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium ${config.className}`}
            >
              <StatusIcon className='size-4' />
              {t(config.labelKey)}
            </p>
          </div>

          <DialogDescription className='flex items-center gap-2'>
            <CalendarIcon className='size-4' />
            {t('mentorApplication.dialog.submitted', { date: submittedDate })}
          </DialogDescription>

          {reviewedDate && (
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <CheckCircle2Icon className='size-4' />
              {t('mentorApplication.dialog.reviewed', { date: reviewedDate })}
            </span>
          )}
        </DialogHeader>

        <Separator />

        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          <div>
            <SectionLabel label={t('mentorApplication.dialog.shortBio')} />
            <div className='rounded-lg bg-muted/50 p-4'>
              <p className='text-sm leading-relaxed'>{application.shortBio}</p>
            </div>
          </div>

          {fileNames.length > 0 && (
            <div>
              <SectionLabel label={t('mentorApplication.dialog.portfolioFiles', { count: fileNames.length })} />
              <div className='flex flex-wrap gap-2'>
                {application.portfolioUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted hover:border-muted-foreground/30'
                  >
                    <FileTextIcon className='size-3.5 text-red-500 shrink-0' />
                    <span className='max-w-[160px] truncate'>{fileNames[i]}</span>
                    <ExternalLinkIcon className='size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel label={t('mentorApplication.dialog.detailedIntroduction')} />
            <div className='rounded-lg bg-muted/50 p-4'>
              <SanitizedHtml html={application.description} />
            </div>
          </div>
        </div>

        {application.adminNote && (
          <>
            <Separator />
            <div className='flex items-start gap-2.5 bg-primary/10 p-4 shrink-0'>
              <AlertCircleIcon className='size-4 shrink-0 text-primary mt-0.5' />
              <div>
                <p className='text-sm font-semibold text-primary'>{t('mentorApplication.dialog.reviewerNote')}</p>
                <p className='text-xs text-primary/80'>{application.adminNote}</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
