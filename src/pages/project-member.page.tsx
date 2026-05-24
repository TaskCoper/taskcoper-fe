import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectTaskStatsPopover from '@/features/projects/charts/components/project-task-stats-popover'
import { useGetProjectTaskStats } from '@/features/projects/charts/hooks/use-get-project-task-stats'
import { projectTaskStatisticsSchema, type ProjectTaskStatisticsParams } from '@/features/projects/charts/validations'
import { useGetProject } from '@/features/projects/core/hooks/use-get-project'
import ProjectMemberTaskTable from '@/features/projects/members/components/project-member-task-table'
import { useGetProjectMember } from '@/features/projects/members/hooks/use-get-project-member'
import { MemberStatus, MemberStatusLabel } from '@/features/projects/members/types'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useDateFormat } from '@/lib/date'
import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
import { cn, getAvatarFallback, getColorTextClass } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { endOfMonth, parseISO, startOfMonth } from 'date-fns'
import { ActivityIcon, GlobeIcon, MapPinIcon, PhoneIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

export default function ProjectMemberPage() {
  const { identifier, memberIdentifier } = useParams<{ identifier: string; memberIdentifier: string }>()
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const { getLastActiveMilestone } = useMilestonePreferencesStore()

  const { project, isLoadingProject } = useGetProject({ identifier })
  const { user, isGettingUser } = useGetUser({ userIdentifier: memberIdentifier })
  const { projectMember, isLoadingProjectMember } = useGetProjectMember({
    projectIdentifier: identifier,
    userId: user?.id
  })

  const parentMilestoneIdentifier = identifier ? getLastActiveMilestone(identifier) : undefined

  const addressText = [user?.address, user?.originalCity, user?.originalState]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')

  const hasAddress = Boolean(addressText)

  const methods = useForm<ProjectTaskStatisticsParams>({
    resolver: zodResolver(projectTaskStatisticsSchema(t)),
    defaultValues: {
      from: startOfMonth(new Date()).toISOString(),
      to: endOfMonth(new Date()).toISOString(),
      isViewInMonth: false,
      parentMilestoneId: null
    }
  })

  const [appliedFilters, setAppliedFilters] = useState<ProjectTaskStatisticsParams>(() => methods.getValues())

  const formFrom = appliedFilters.from
  const formTo = appliedFilters.to
  const formIsViewInMonth = appliedFilters.isViewInMonth

  const { projectTaskStats, isLoadingProjectTaskStats } = useGetProjectTaskStats({
    projectId: project?.id,
    from: formFrom,
    to: formTo,
    isViewInMonth: formIsViewInMonth,
    userId: user?.id
  })

  const isLoading = isLoadingProject || isGettingUser || isLoadingProjectMember

  const taskStatsChartData = useMemo(() => {
    return (
      projectTaskStats?.map((item) => {
        const start = parseISO(item.startDate)
        const end = parseISO(item.endDate)
        const period = formIsViewInMonth
          ? formatDate(start, 'monthShort')
          : `${formatDate(start, 'dayMonth')} - ${formatDate(end, 'dayMonth')}`
        return {
          period,
          created: item.totalTasksCreated,
          completed: item.totalTaskCompleted
        }
      }) ?? []
    )
  }, [projectTaskStats, formIsViewInMonth, formatDate])

  const taskStatsRangeLabel = useMemo(() => {
    const fromLabel = formFrom ? formatDate(formFrom, 'dateMedium') : ''
    const toLabel = formTo ? formatDate(formTo, 'dateMedium') : ''
    const viewBy = formIsViewInMonth ? t('common.ui.month') : t('common.ui.week')

    return `${fromLabel} - ${toLabel} (${viewBy})`
  }, [formFrom, formTo, formIsViewInMonth, t, formatDate])

  const projectTaskStatsChartConfig = useMemo(
    () =>
      ({
        created: {
          label: t('projectPerformance.chartCreated'),
          color: '#00bcff'
        },
        completed: {
          label: t('projectPerformance.chartCompleted'),
          color: '#00d492'
        }
      }) satisfies ChartConfig,
    [t]
  )

  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-12 gap-8 p-6'>
          <div className='col-span-3 space-y-4'>
            <div className='flex flex-col items-center space-y-4'>
              <Skeleton className='size-64 rounded-full' />
              <div className='w-full space-y-2'>
                <Skeleton className='h-7 w-2/3 mx-auto' />
                <Skeleton className='h-4 w-3/4 mx-auto' />
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Skeleton className='h-6 w-22 rounded-full' />
              <Skeleton className='h-6 w-18 rounded-full' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>

            <Separator />

            <div className='space-y-3'>
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-4 w-3/5' />
              <Skeleton className='h-4 w-4/5' />
            </div>

            <Separator />

            <div className='space-y-3'>
              <Skeleton className='h-4 w-1/3' />
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-6 w-24 rounded-md' />
                <Skeleton className='h-6 w-20 rounded-md' />
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <Skeleton className='h-4 w-1/4' />
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-6 w-18 rounded-md' />
                <Skeleton className='h-6 w-22 rounded-md' />
                <Skeleton className='h-6 w-16 rounded-md' />
              </div>
            </div>
          </div>

          <div className='col-span-9'>
            <Card className='shadow-none rounded-lg p-4 gap-10'>
              <div className='space-y-4'>
                <div className='flex justify-between items-start gap-2'>
                  <div className='space-y-2 w-full'>
                    <Skeleton className='h-5 w-44' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                  <Skeleton className='size-8 rounded-md' />
                </div>

                <div className='h-44 rounded-lg border border-border/60 px-4 py-5'>
                  <div className='flex h-full items-end gap-3'>
                    <Skeleton className='h-14 w-full rounded-sm' />
                    <Skeleton className='h-24 w-full rounded-sm' />
                    <Skeleton className='h-10 w-full rounded-sm' />
                    <Skeleton className='h-30 w-full rounded-sm' />
                    <Skeleton className='h-18 w-full rounded-sm' />
                    <Skeleton className='h-26 w-full rounded-sm' />
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <div>
                  <Skeleton className='h-5 w-36' />
                  <Skeleton className='mt-2 h-4 w-56' />
                </div>

                <div className='rounded-md border p-3 space-y-2'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='grid grid-cols-12 gap-8 p-6'>
        <div className='col-span-3 space-y-3 mx-auto'>
          <Avatar className='size-64 border border-border'>
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className='text-7xl'>
              {getAvatarFallback(`${user?.firstName} ${user?.lastName}`)}
            </AvatarFallback>
          </Avatar>

          <div className='-space-y-1'>
            <p className='text-2xl font-bold'>
              {user?.firstName} {user?.lastName}
            </p>
            <p className='text-muted-foreground'>{user?.email}</p>

            <div className='flex flex-wrap gap-2 mt-2'>
              {projectMember?.roles && projectMember.roles.length > 0 ? (
                projectMember.roles.map((role) => (
                  <Badge key={role.id} className='rounded-md'>
                    {role.name}
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noRoles')}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className='flex items-center gap-2'>
            <ActivityIcon
              className={cn(
                'size-3.5',
                projectMember?.status === MemberStatus.Busy ? 'text-rose-600' : 'text-green-600'
              )}
            />
            {projectMember?.status ? (
              <p
                className={cn(
                  'text-sm font-medium',
                  projectMember.status === MemberStatus.Busy ? 'text-rose-600' : 'text-green-600'
                )}
              >
                {t(MemberStatusLabel[projectMember.status])}
              </p>
            ) : (
              <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noStatus')}</p>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <GlobeIcon className='size-3.5 text-muted-foreground' />
            {user?.timeZone ? (
              <p className='text-sm'>{user.timeZone}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noTimeZone')}</p>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <PhoneIcon className='size-3.5 text-muted-foreground' />
            {user?.phoneNumber ? (
              <p className='text-sm'>{user.phoneNumber}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noPhoneNumber')}</p>
            )}
          </div>

          <div className='flex items-start gap-2'>
            <MapPinIcon className='size-3.5 text-muted-foreground shrink-0 self-start mt-0.5' />
            {hasAddress ? (
              <p className='text-sm leading-5'>{addressText}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noAddress')}</p>
            )}
          </div>

          <Separator />

          <div className='space-y-1'>
            <p className='font-medium'>{t('project.memberProfile.positionTitles')}</p>
            <div className='flex flex-wrap gap-2'>
              {(projectMember?.positionTitles?.length ?? 0) > 0 ? (
                projectMember?.positionTitles.map((title) => (
                  <div key={title.id} className={cn('rounded-sm px-2 py-0.5', title.color)}>
                    <p className={cn('text-xs font-medium', getColorTextClass(title.color))}>{title.name}</p>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noDomains')}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className='space-y-1'>
            <p className='font-medium'>{t('project.memberProfile.domains')}</p>
            <div className='flex flex-wrap gap-2'>
              {projectMember?.domains && projectMember.domains.length > 0 ? (
                projectMember.domains.map((domain) => (
                  <Badge key={domain.id} className='rounded-md' variant='outline'>
                    {domain.name}
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>{t('project.memberProfile.noDomains')}</p>
              )}
            </div>
          </div>
        </div>

        <div className='col-span-9 space-y-4'>
          <Card className='shadow-none rounded-lg p-4 gap-10'>
            <div className='space-y-4'>
              <div className='flex justify-between items-start gap-2'>
                <div>
                  <p className='font-semibold'>{t('projectPerformance.taskStatistics')}</p>
                  <p className='text-xs text-muted-foreground'>{taskStatsRangeLabel}</p>
                </div>

                <FormProvider {...methods}>
                  <ProjectTaskStatsPopover onApplyFilters={setAppliedFilters} />
                </FormProvider>
              </div>

              {isLoadingProjectTaskStats ? (
                <div className='h-44 rounded-lg border border-border/60 px-4 py-5'>
                  <div className='flex h-full items-end gap-3'>
                    <Skeleton className='h-14 w-full rounded-sm' />
                    <Skeleton className='h-24 w-full rounded-sm' />
                    <Skeleton className='h-10 w-full rounded-sm' />
                    <Skeleton className='h-30 w-full rounded-sm' />
                    <Skeleton className='h-18 w-full rounded-sm' />
                    <Skeleton className='h-26 w-full rounded-sm' />
                  </div>
                </div>
              ) : taskStatsChartData.length > 0 ? (
                <ChartContainer config={projectTaskStatsChartConfig} className='max-h-32 w-full'>
                  <BarChart accessibilityLayer data={taskStatsChartData} barCategoryGap={18} barGap={6}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='period'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
                    <Bar dataKey='created' fill='var(--color-created)' radius={4} barSize={14} />
                    <Bar dataKey='completed' fill='var(--color-completed)' radius={4} barSize={14} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className='text-sm text-muted-foreground text-center py-10'>
                  {t('projectPerformance.noTaskStatistics')}
                </p>
              )}
            </div>

            {identifier ? (
              <ProjectMemberTaskTable
                projectIdentifier={identifier}
                parentMilestoneIdentifier={parentMilestoneIdentifier}
                memberId={user?.id}
              />
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}
