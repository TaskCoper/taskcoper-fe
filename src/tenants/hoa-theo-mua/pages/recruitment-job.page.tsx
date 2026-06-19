import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDateFormat } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BanIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ChevronsRightIcon,
  CircleCheckBigIcon,
  CoinsIcon,
  GraduationCapIcon,
  ImageOffIcon,
  MapPinIcon,
  TrendingUpIcon,
  UsersIcon
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetJobDescription } from '../features/job-descriptions/hooks/use-get-job-description'
import {
  EmploymentTypeLabel,
  JobDescriptionLevelLabel,
  JobDescriptionStatus,
  JobDescriptionStatusLabel
} from '../features/job-descriptions/types'

export default function RecruitmentJobPage() {
  const { t } = useTenantTranslation()
  const { i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { formatDate } = useDateFormat()

  const { jobDescription, isGettingJobDescription } = useGetJobDescription({ id })

  const moneyFormatter = new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  })

  const formatSalary = () => {
    if (!jobDescription) return t('recruitment.jobs.salary.undisclosed')
    const { salaryMin, salaryMax, salaryNegotiable } = jobDescription
    if (salaryNegotiable) return t('recruitment.jobs.salary.negotiable')
    const min = salaryMin ?? 0
    const max = salaryMax ?? 0
    if (min > 0 && max > 0) return `${moneyFormatter.format(min)} - ${moneyFormatter.format(max)}`
    if (min > 0) return t('recruitment.jobs.salary.from', { amount: moneyFormatter.format(min) })
    if (max > 0) return t('recruitment.jobs.salary.upTo', { amount: moneyFormatter.format(max) })
    return t('recruitment.jobs.salary.undisclosed')
  }

  const generalItems = [
    {
      label: t('recruitment.jobs.column.location'),
      value: jobDescription?.location || null,
      icon: MapPinIcon
    },
    {
      label: t('recruitment.jobs.column.employmentType'),
      value: jobDescription ? t(EmploymentTypeLabel[jobDescription.employmentType]) : null,
      icon: BriefcaseIcon
    },
    {
      label: t('recruitment.jobs.detail.level'),
      value: jobDescription ? t(JobDescriptionLevelLabel[jobDescription.level]) : null,
      icon: GraduationCapIcon
    },
    {
      label: t('recruitment.jobs.detail.experience'),
      value: jobDescription
        ? t('recruitment.jobs.detail.experienceRange', {
            min: jobDescription.minExperienceYears,
            max: jobDescription.maxExperienceYears
          })
        : null,
      icon: TrendingUpIcon
    },
    {
      label: t('recruitment.jobs.column.openings'),
      value: jobDescription?.openings ?? null,
      icon: UsersIcon
    }
  ]

  useEffect(() => {
    if (jobDescription) {
      document.title = `${jobDescription.title} | TaskCoper`
    }
  }, [jobDescription])

  if (isGettingJobDescription) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10'>
        <Skeleton className='h-24 col-span-1 lg:col-span-12' />
        <Skeleton className='h-60 col-span-1 lg:col-span-8' />
        <Skeleton className='h-28 col-span-1 lg:col-span-4' />
      </div>
    )
  }

  const isOpen = jobDescription?.status === JobDescriptionStatus.open

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
        <div className='col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-8'>
          {/* Left column */}
          <div className='col-span-1 lg:col-span-8'>
            <div className='relative h-48 sm:h-52'>
              <div className='size-full group/cover relative'>
                {jobDescription?.coverImageUrl ? (
                  <img
                    src={jobDescription.coverImageUrl}
                    alt={t('recruitment.jobs.detail.coverImageAlt', { title: jobDescription.title })}
                    className='size-full object-cover rounded-2xl shadow-sm border border-border'
                  />
                ) : (
                  <div className='size-full rounded-2xl bg-muted flex items-center justify-center'>
                    <ImageOffIcon className='size-10 text-muted-foreground' />
                  </div>
                )}
              </div>

              <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 size-28 lg:size-32 z-20 group/logo rounded-2xl bg-muted shadow-sm'>
                {jobDescription?.avatarUrl ? (
                  <img
                    src={jobDescription.avatarUrl}
                    alt={t('recruitment.jobs.detail.logoImageAlt', { title: jobDescription.title })}
                    className='size-full object-cover rounded-xl shadow-sm border border-border'
                  />
                ) : (
                  <div className='size-full flex items-center justify-center'>
                    <ImageOffIcon className='size-8 text-muted-foreground' />
                  </div>
                )}
              </div>
            </div>

            <div className='mt-16 mb-8 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4'>
              <div className='lg:px-6 w-full'>
                <h1 className='text-2xl sm:text-3xl font-semibold wrap-break-word'>{jobDescription?.title}</h1>
              </div>

              <div className='w-full'>
                <Card className='w-full text-sm sm:text-base text-left p-0 shadow-none gap-0 rounded-2xl'>
                  <div className='px-3 py-2 flex items-center gap-2 bg-muted/60 rounded-t-2xl'>
                    <BookOpenIcon className='size-4 text-muted-foreground' />
                    <p className='text-sm font-semibold text-muted-foreground'>
                      {t('recruitment.jobs.detail.description')}
                    </p>
                  </div>
                  <Separator />
                  <div className='p-4'>
                    {jobDescription?.description ? (
                      <SanitizedHtml html={jobDescription.description} />
                    ) : (
                      <p className='text-xs text-muted-foreground text-center'>{t('common.ui.noDescription')}</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className='col-span-1 lg:col-span-4 space-y-6'>
            <div className='space-y-2'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <div>
                  <p className='font-semibold'>{t('recruitment.jobs.column.status')}</p>
                </div>
                {jobDescription ? (
                  <Badge
                    variant='outline'
                    className={cn(
                      'gap-1',
                      isOpen
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    )}
                  >
                    {isOpen ? (
                      <CircleCheckBigIcon className='size-3 text-emerald-500' />
                    ) : (
                      <BanIcon className='size-3 text-rose-500' />
                    )}
                    {t(JobDescriptionStatusLabel[jobDescription.status])}
                  </Badge>
                ) : null}
              </div>
            </div>
            <Separator />
            <div className='space-y-6'>
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <p className='font-semibold'>{t('recruitment.jobs.detail.salary')}</p>
                    <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.salaryDescription')}</p>
                  </div>
                </div>

                <Card className='p-4 border-dashed shadow-none flex-row items-center gap-3'>
                  <CoinsIcon className='size-5 text-primary' />
                  <p className='font-bold text-primary'>{formatSalary()}</p>
                </Card>
              </div>

              <Separator />
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <p className='font-semibold'>{t('recruitment.jobs.detail.general')}</p>
                    <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.generalDescription')}</p>
                  </div>
                </div>

                <div className='space-y-3 mt-4'>
                  {generalItems.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between hover:bg-muted/40 transition-colors group'
                    >
                      <div className='flex items-center gap-2.5 text-muted-foreground'>
                        <item.icon className='size-4' />
                        <p className='text-xs font-medium'>{item.label}</p>
                      </div>

                      <p className='text-xs font-semibold max-w-[70%] truncate' title={String(item.value)}>
                        {item.value ?? <span className='text-muted-foreground/40'>-</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <p className='font-semibold'>{t('recruitment.jobs.detail.timeline')}</p>
                    <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.timelineDescription')}</p>
                  </div>
                </div>

                <Card className='p-4 border-dashed shadow-none flex-row items-center justify-between gap-4'>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.createdAt')}</p>
                    <p className='font-bold text-primary'>
                      {jobDescription?.createdAt ? formatDate(jobDescription.createdAt, 'dateMedium') : 'N/A'}
                    </p>
                  </div>

                  <ChevronsRightIcon className='size-5 text-muted-foreground' />

                  <div>
                    <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.updatedAt')}</p>
                    <p className='font-bold text-primary'>
                      {jobDescription?.updatedAt ? formatDate(jobDescription.updatedAt, 'dateMedium') : 'N/A'}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
