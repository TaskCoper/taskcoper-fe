import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ApplicationStatusFilter } from '@/features/mentor-applications/components/application-status-filter'
import { useGetMentorApplications } from '@/features/mentor-applications/hooks/use-get-mentor-applications'
import type { GetMyMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import { useReviewMentorApplication } from '@/features/mentor-applications/hooks/use-review-mentor-application'
import type { ReviewMentorApplicationFormValues } from '@/features/mentor-applications/validations'
import { STATUS_CONFIG } from '@/shared/constants'
import { formatDate } from '@/shared/utils'
import type { Application } from '@/types/mentor-application.type'
import { ApplicationStatus, MentorTitle, MentorTitleLabel } from '@/types/mentor-application.type'
import { type i18n as Ii18n, type TFunction } from 'i18next'
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileTextIcon,
  LinkIcon,
  LockKeyholeIcon
} from 'lucide-react'
import { useState } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const StatusFlag = ({ status }: { status: Application['status'] }) => {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className='size-3' />
      {t(config.labelKey)}
    </span>
  )
}

const UrlCountFlag = ({ count }: { count: number }) => {
  const { t } = useTranslation()

  return (
    <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
      <LinkIcon className='size-3' />
      {t('mentorApplication.list.fileCount', { count })}
    </span>
  )
}

const SectionLabel = ({ label }: { label: string }) => {
  return <p className='text-sm font-medium text-muted-foreground mb-2'>{label}</p>
}

export default function SystemMentorApplicationsPage() {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<ApplicationStatus>()
  const [sortBy, setSortBy] = useState<GetMyMentorApplicationsParams['sortBy']>('-createdat')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const { applications, isLoadingMentorApplications } = useGetMentorApplications({ status, sortBy })

  const selectedApplication = applications?.value?.items?.find((app) => app.applicationId === selectedApplicationId)

  // Auto-select the first application once loaded if none is selected
  if (!isLoadingMentorApplications && applications?.value?.items?.length > 0 && !selectedApplicationId) {
    setSelectedApplicationId(applications.value.items[0].applicationId)
  }

  return (
    <div className='flex flex-col h-[calc(100vh-64px)] min-h-0 p-4 gap-4'>
      <div className='flex items-center gap-2 shrink-0'>
        <div className='flex-1'>
          <p className='text-xl font-bold'>{t('mentorApplication.list.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('mentorApplication.list.adminDescription')}</p>
        </div>

        <ApplicationStatusFilter value={status} onValueChange={setStatus} />

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as GetMyMentorApplicationsParams['sortBy'])}>
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
      </div>

      <div className='flex-1 min-h-0 grid grid-cols-12 gap-4'>
        <div className='col-span-5 flex flex-col min-h-0 h-full border rounded-xl overflow-hidden bg-background'>
          <div className='flex-1 overflow-y-auto p-3 space-y-2'>
            {isLoadingMentorApplications ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className='overflow-hidden p-0 gap-0 rounded-lg'>
                  <div className='flex flex-col gap-3 p-3'>
                    <div className='flex items-center justify-between'>
                      <Skeleton className='h-4 w-1/3' />
                      <Skeleton className='h-6 w-20 rounded-full' />
                    </div>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-2/3' />
                  </div>
                </Card>
              ))
            ) : applications?.value?.items?.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-muted-foreground gap-2'>
                <FileTextIcon className='size-8 opacity-20' />
                <p className='text-sm'>{t('mentorApplication.list.noApplications')}</p>
              </div>
            ) : (
              applications.value.items.map((application) => {
                const isSelected = application.applicationId === selectedApplicationId

                return (
                  <Card
                    key={application.applicationId}
                    className={`overflow-hidden p-0 gap-0 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:border-foreground/20'
                    }`}
                    onClick={() => setSelectedApplicationId(application.applicationId)}
                  >
                    <div className='flex flex-col gap-3 p-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-sm font-medium line-clamp-1 break-all'>{application.shortBio}</p>
                          <p className='text-xs text-muted-foreground flex items-center gap-1'>
                            <CalendarIcon className='size-3 text-muted-foreground/60' />
                            {formatDate(application.createdOnUtc)}
                          </p>
                        </div>
                        <div className='flex flex-col items-end gap-1.5 shrink-0'>
                          <StatusFlag status={application.status} />
                          {application.portfolioUrls?.length > 0 && (
                            <UrlCountFlag count={application.portfolioUrls.length} />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        <div className='col-span-7 flex flex-col min-h-0 h-full border rounded-xl overflow-hidden bg-card'>
          {selectedApplication ? (
            <ApplicationDetailView application={selectedApplication} t={t} i18n={i18n} />
          ) : (
            <div className='flex items-center justify-center h-full text-muted-foreground flex-col gap-2'>
              <FileTextIcon className='size-10 opacity-20' />
              <p>{t('mentorApplication.list.selectApplicationToView')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ApplicationDetailView = ({ application, t, i18n }: { application: Application; t: TFunction; i18n: Ii18n }) => {
  const config = STATUS_CONFIG[application.status]
  const StatusIcon = config.icon

  const { methods, reviewMentorApplication, isReviewingMentorApplication } = useReviewMentorApplication()

  const onSubmit: SubmitHandler<ReviewMentorApplicationFormValues> = (body) => {
    reviewMentorApplication({ body })
  }

  const handleReview = (status: ApplicationStatus) => {
    methods.setValue('applicationId', application.applicationId)
    methods.setValue('status', status)
    methods.handleSubmit(onSubmit)()
  }

  const getNextStatusLabel = () => {
    if (application.status === ApplicationStatus.PENDING) return t('mentorApplication.button.markInReview')
    if (application.status === ApplicationStatus.IN_REVIEW) return t('mentorApplication.button.moveToOffers')
    if (application.status === ApplicationStatus.IN_OFFERS) return t('mentorApplication.button.approve')
    return ''
  }

  const getNextStatusValue = () => {
    if (application.status === ApplicationStatus.PENDING) return ApplicationStatus.IN_REVIEW
    if (application.status === ApplicationStatus.IN_REVIEW) return ApplicationStatus.IN_OFFERS
    if (application.status === ApplicationStatus.IN_OFFERS) return ApplicationStatus.APPROVED
    return ApplicationStatus.APPROVED
  }

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const submittedDate = new Date(application.createdOnUtc).toLocaleDateString(i18n.language, dateFormatOptions)

  const reviewedDate = application.reviewedAt
    ? new Date(application.reviewedAt).toLocaleDateString(i18n.language, dateFormatOptions)
    : null

  const fileNames = (application.portfolioUrls ?? []).map((url) => {
    const raw = url.split('/').pop() ?? url
    return raw.replace(/^[a-z0-9]+-/, '')
  })

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='p-4 gap-0 bg-muted/20 border-b shrink-0'>
        <div className='flex items-start justify-between gap-3'>
          <h2 className='text-lg font-semibold'>{t('mentorApplication.dialog.title')}</h2>

          <p
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium ${config.className}`}
          >
            <StatusIcon className='size-4' />
            {t(config.labelKey)}
          </p>
        </div>

        <div className='flex flex-col gap-1.5'>
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CalendarIcon className='size-3 text-muted-foreground' />
            {t('mentorApplication.dialog.submitted', { date: submittedDate })}
          </p>

          {reviewedDate && (
            <span className='flex items-center gap-2 text-sm text-muted-foreground'>
              <CheckCircle2Icon className='size-4' />
              {t('mentorApplication.dialog.reviewed', { date: reviewedDate })}
            </span>
          )}
        </div>
      </div>

      <div
        className={`flex-1 relative ${application.status === ApplicationStatus.PENDING ? 'overflow-hidden' : 'overflow-y-auto'}`}
      >
        {application.status === ApplicationStatus.PENDING && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]'>
            <LockKeyholeIcon className='size-12 mb-3' />
            <p className='text-muted-foreground text-sm'>{t('mentorApplication.status.pendingLock')}</p>
          </div>
        )}

        <div
          className={`p-4 space-y-8 ${application.status === ApplicationStatus.PENDING ? 'blur-sm pointer-events-none opacity-50 select-none' : ''}`}
        >
          <div>
            <SectionLabel label={t('mentorApplication.dialog.shortBio')} />
            <Card className='p-3 shadow-none rounded-lg'>
              <p className='text-sm leading-relaxed'>{application.shortBio}</p>
            </Card>
          </div>

          {fileNames.length > 0 && (
            <div>
              <SectionLabel label={t('mentorApplication.dialog.portfolioFiles', { count: fileNames.length })} />
              <div className='flex flex-wrap gap-2 mt-2'>
                {application.portfolioUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:border-muted-foreground/30 shadow-sm'
                  >
                    <FileTextIcon className='size-4 text-blue-500 shrink-0' />
                    <span className='max-w-[200px] truncate'>{fileNames[i]}</span>
                    <ExternalLinkIcon className='size-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0' />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel label={t('mentorApplication.dialog.detailedIntroduction')} />
            <Card className='p-3 shadow-none rounded-lg'>
              <SanitizedHtml html={application.description} />
            </Card>
          </div>
        </div>
      </div>

      {application.adminNote && (
        <div className='flex items-start gap-2 bg-blue-50/50 p-4 shrink-0 border-t'>
          <AlertCircleIcon className='size-4 shrink-0 text-blue-500 mt-0.5' />
          <div>
            <p className='text-sm font-semibold text-blue-700'>{t('mentorApplication.dialog.reviewerNote')}</p>
            <p className='text-sm text-blue-900/80'>{application.adminNote}</p>
          </div>
        </div>
      )}

      {(
        [ApplicationStatus.PENDING, ApplicationStatus.IN_REVIEW, ApplicationStatus.IN_OFFERS] as ApplicationStatus[]
      ).includes(application.status) && (
        <div className='p-4 border-t shrink-0 bg-muted/10'>
          {application.status === ApplicationStatus.IN_OFFERS && (
            <Controller
              control={methods.control}
              name='titleLevel'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                  <FieldLabel htmlFor={field.name}>{t('mentorApplication.dialog.titleLevel')}</FieldLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={isReviewingMentorApplication}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder={t('mentorApplication.dialog.titleLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(MentorTitle).map((title) => (
                          <SelectItem key={title} value={title}>
                            {t(MentorTitleLabel[title])}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className='min-h-4 mt-1'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          )}

          {application.status !== ApplicationStatus.PENDING && (
            <Controller
              control={methods.control}
              name='adminNote'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
                  <FieldLabel htmlFor={field.name}>{t('mentorApplication.dialog.reviewerNoteTitle')}</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id={field.name}
                      placeholder={t('mentorApplication.dialog.reviewerNotePlaceholder')}
                      rows={3}
                      className='min-h-20 resize-none wrap-break-word'
                      disabled={isReviewingMentorApplication}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align='block-end'>
                      <InputGroupText className='tabular-nums text-xs'>
                        {(field.value ?? '').length}/255 {t('common.ui.characters')}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <div className='min-h-4 mt-1'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />
          )}

          <div className='flex gap-2 justify-end'>
            {application.status !== ApplicationStatus.PENDING && (
              <Button
                type='button'
                size='sm'
                variant='destructive'
                disabled={isReviewingMentorApplication}
                onClick={() => handleReview(ApplicationStatus.REJECTED)}
              >
                {isReviewingMentorApplication ? <Spinner /> : null}
                {t('mentorApplication.button.reject')}
              </Button>
            )}

            <Button
              type='button'
              size='sm'
              disabled={isReviewingMentorApplication}
              onClick={() => handleReview(getNextStatusValue())}
              className='bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              {isReviewingMentorApplication ? <Spinner /> : null}
              {getNextStatusLabel()}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
