import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ApplicationStatusFilter } from '@/features/mentor-applications/components/application-status-filter'
import MentorApplicationDialog from '@/features/mentor-applications/components/mentor-application-dialog'
import {
  useGetMyMentorApplications,
  type GetMyMentorApplicationsParams
} from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import type { Application, ApplicationStatus } from '@/features/mentor-applications/types'
import { STATUS_CONFIG } from '@/shared/constants'
import { formatDate } from '@/shared/utils'
import { LinkIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const StatusFlag = ({ status }: { status: Application['status'] }) => {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className='size-3' />
      {t(config.labelKey)}
    </span>
  )
}

const UrlCountFlag = ({ count }: { count: number }) => {
  const { t } = useTranslation()

  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
      <LinkIcon className='size-3' />
      {t('mentorApplication.list.fileCount', { count })}
    </span>
  )
}

export default function MentorApplicationsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ApplicationStatus>()
  const [sortBy, setSortBy] = useState<GetMyMentorApplicationsParams['sortBy']>('-createdat')

  const { applications, isLoadingMyMentorApplications } = useGetMyMentorApplications({ status, sortBy })

  return (
    <div className='absolute inset-0 overflow-auto'>
      <div className='mx-auto max-w-4xl space-y-10 p-4 pb-10'>
        <div>
          <p className='text-2xl font-bold'>{t('mentorApplication.list.title')}</p>
          <p className='text-muted-foreground text-sm'>{t('mentorApplication.list.description')}</p>
        </div>

        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <ApplicationStatusFilter value={status} onValueChange={setStatus} />

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as GetMyMentorApplicationsParams['sortBy'])}
            >
              <SelectTrigger size='sm' className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='-createdat'>{t('mentorApplication.list.sortLatest')}</SelectItem>
                  <SelectItem value='createdat'>{t('mentorApplication.list.sortOldest')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className='flex-1' />

            <Link to='submit' className='ml-auto'>
              <Button size='sm'>
                <PlusIcon />
                {t('mentorApplication.list.newApplication')}
              </Button>
            </Link>
          </div>

          <div className='space-y-3'>
            {isLoadingMyMentorApplications
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className='overflow-hidden p-0 gap-0 rounded-lg'>
                    <div className='flex items-center gap-3 p-3'>
                      <Skeleton className='size-8 rounded-full shrink-0' />
                      <div className='flex-1 min-w-0 space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Skeleton className='h-6 w-20 rounded-full' />
                        <Skeleton className='h-6 w-24 rounded-full' />
                      </div>
                    </div>
                  </Card>
                ))
              : applications.value.items.map((application, index) => {
                  return (
                    <MentorApplicationDialog application={application} key={application.applicationId}>
                      <Card className='overflow-hidden p-0 gap-0 rounded-lg cursor-pointer'>
                        <div className='flex items-center gap-3 p-3'>
                          <div className='size-8 bg-primary/10 rounded-full flex justify-center items-center shrink-0'>
                            <p className='text-primary font-bold font-mono'>{index + 1}</p>
                          </div>

                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>{application.shortBio}</p>
                            <p className='text-xs text-muted-foreground'>{formatDate(application.createdOnUtc)}</p>
                          </div>

                          <div className='flex items-center gap-2 shrink-0'>
                            <UrlCountFlag count={application.portfolioUrls?.length ?? 0} />
                            <StatusFlag status={application.status} />
                          </div>
                        </div>
                      </Card>
                    </MentorApplicationDialog>
                  )
                })}
          </div>
        </div>
      </div>
    </div>
  )
}
