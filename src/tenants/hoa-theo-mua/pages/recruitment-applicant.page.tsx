import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getAvatarFallback } from '@/shared/utils'
import { BriefcaseIcon, CalendarIcon, MailIcon, MailOpenIcon, PaperclipIcon, PhoneIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useGetRecruitmentRequest } from '../features/recruitment-requests/hooks/use-get-recruitment-request'
import { useReadRecruitmentRequest } from '../features/recruitment-requests/hooks/use-read-recruitment-request'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

export default function RecruitmentApplicantPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()

  const { recruitmentRequest, isGettingRecruitmentRequest } = useGetRecruitmentRequest({ id })
  const { readRecruitmentRequest, isMarkingAsRead } = useReadRecruitmentRequest()

  if (isGettingRecruitmentRequest) {
    return (
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 space-y-6'>
        <Skeleton className='h-16' />
        <Skeleton className='h-40' />
        <Skeleton className='h-60' />
      </div>
    )
  }

  const { user, jobDescription, title, coverLetter, attachments, createdAt, isRead } = recruitmentRequest ?? {}

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-6'>
        {/* Header */}
        <div className='flex items-start gap-4'>
          <Avatar className='rounded-xl size-14 ring-1 ring-border shrink-0'>
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className='rounded-xl bg-primary/10 text-primary font-semibold'>
              {getAvatarFallback(user?.fullName ?? '')}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='text-2xl font-semibold'>{user?.fullName}</h1>
              <Badge
                variant='outline'
                className={
                  isRead
                    ? 'text-slate-600 bg-slate-50 border-slate-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200 font-semibold'
                }
              >
                {isRead ? t('recruitment.applicants.status.read') : t('recruitment.applicants.status.unread')}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>{title}</p>
          </div>
        </div>

        <Separator />

        {/* Info cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Card className='p-4 shadow-none flex-row items-center gap-3'>
            <MailIcon className='size-4 text-muted-foreground shrink-0' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('recruitment.applicants.detail.email')}</p>
              <p className='font-medium text-sm truncate'>{user?.email}</p>
            </div>
          </Card>

          <Card className='p-4 shadow-none flex-row items-center gap-3'>
            <PhoneIcon className='size-4 text-muted-foreground shrink-0' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('recruitment.applicants.detail.phone')}</p>
              <p className='font-medium text-sm'>
                {user?.phoneNumber ?? (
                  <span className='text-muted-foreground'>{t('recruitment.applicants.column.noPhone')}</span>
                )}
              </p>
            </div>
          </Card>

          <Card className='p-4 shadow-none flex-row items-center gap-3'>
            <BriefcaseIcon className='size-4 text-muted-foreground shrink-0' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('recruitment.applicants.detail.jobPosting')}</p>
              {jobDescription ? (
                <Link
                  to={`../..recruitment/${jobDescription.id}`}
                  className='font-medium text-sm hover:underline truncate block'
                >
                  {jobDescription.title}
                </Link>
              ) : null}
            </div>
          </Card>

          <Card className='p-4 shadow-none flex-row items-center gap-3'>
            <CalendarIcon className='size-4 text-muted-foreground shrink-0' />
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{t('recruitment.applicants.column.appliedAt')}</p>
              <p className='font-medium text-sm'>{createdAt ? dateFormatter.format(new Date(createdAt)) : '-'}</p>
            </div>
          </Card>
        </div>

        {/* Cover letter */}
        <Card className='shadow-none gap-0 p-0 rounded-2xl'>
          <div className='px-4 py-3 flex items-center gap-2 bg-muted/60 rounded-t-2xl'>
            <p className='text-sm font-semibold text-muted-foreground'>
              {t('recruitment.applicants.detail.coverLetter')}
            </p>
          </div>
          <Separator />
          <div className='p-4'>
            {coverLetter ? (
              <SanitizedHtml html={coverLetter} />
            ) : (
              <p className='text-xs text-muted-foreground text-center'>{t('common.ui.noDescription')}</p>
            )}
          </div>
        </Card>

        {/* Attachments */}
        {attachments && attachments.length > 0 ? (
          <Card className='shadow-none gap-0 p-0 rounded-2xl'>
            <div className='px-4 py-3 flex items-center gap-2 bg-muted/60 rounded-t-2xl'>
              <p className='text-sm font-semibold text-muted-foreground'>
                {t('recruitment.applicants.detail.attachments')}
              </p>
            </div>
            <Separator />
            <div className='p-4 space-y-2'>
              {attachments.map((url, index) => (
                <Button key={index} variant='outline' size='sm' asChild className='w-full justify-start gap-2'>
                  <a href={url} target='_blank' rel='noopener noreferrer'>
                    <PaperclipIcon className='size-3.5' />
                    {t('recruitment.applicants.detail.attachment', { index: index + 1 })}
                  </a>
                </Button>
              ))}
            </div>
          </Card>
        ) : null}

        {recruitmentRequest && !isRead ? (
          <Button
            variant='outline'
            size='sm'
            disabled={isMarkingAsRead}
            onClick={() => id && readRecruitmentRequest({ id })}
            className='w-full'
          >
            <MailOpenIcon />
            {t('recruitment.applicants.actions.markAsRead')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
