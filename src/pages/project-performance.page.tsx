import Heatmap, { type CalendarHeatmapData } from '@/components/heatmap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectTaskStatsPopover from '@/features/charts/components/project-task-stats-popover'
import { useGetProjectTaskStats } from '@/features/charts/hooks/use-get-project-task-stats'
import { projectTaskStatisticsSchema, type ProjectTaskStatisticsParams } from '@/features/charts/validations'
import { useGetParentMilestones } from '@/features/milestones/hooks/use-get-parent-milestones'
import StatCard from '@/features/projects/components/stat-card'
import { useGetProjectHeatmap } from '@/features/projects/hooks/use-get-project-heatmap'
import type { ProjectHeatmap } from '@/types/efficiency.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { endOfMonth, format, getYear, parseISO, startOfMonth } from 'date-fns'
import {
  CircleCheckBigIcon,
  LayersPlus,
  ListTreeIcon,
  MessageCircleIcon,
  PaperclipIcon,
  TrendingUp
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import BarChartHorizontal from '../components/bar-chart-horizontal'

function mapToHeatmapData(stats: ProjectHeatmap[]): CalendarHeatmapData<Omit<ProjectHeatmap, 'statisticDate'>>[] {
  const aggregated = new Map<string, Omit<ProjectHeatmap, 'statisticDate'>>()

  for (const entry of stats) {
    const existing = aggregated.get(entry.statisticDate) ?? {
      totalTasksCreated: 0,
      totalSubtasksCreated: 0,
      totalCommentsCreated: 0,
      totalFilesUploaded: 0,
      totalTasksCompleted: 0
    }

    aggregated.set(entry.statisticDate, {
      totalTasksCreated: existing.totalTasksCreated + entry.totalTasksCreated,
      totalSubtasksCreated: existing.totalSubtasksCreated + entry.totalSubtasksCreated,
      totalCommentsCreated: existing.totalCommentsCreated + entry.totalCommentsCreated,
      totalFilesUploaded: existing.totalFilesUploaded + entry.totalFilesUploaded,
      totalTasksCompleted: existing.totalTasksCompleted + entry.totalTasksCompleted
    })
  }

  return Array.from(aggregated, ([dateStr, raw]) => ({
    date: new Date(dateStr),
    count:
      raw.totalTasksCreated +
      raw.totalSubtasksCreated +
      raw.totalCommentsCreated +
      raw.totalFilesUploaded +
      raw.totalTasksCompleted,
    raw
  }))
}

const today = format(new Date(), 'yyyy-MM-dd')
const currentDateRange = {
  from: today,
  to: today
}

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function ProjectPerformancePage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const dateRange = useMemo(() => {
    const from = format(new Date(selectedYear, 0, 1), 'yyyy-MM-dd')
    const to = selectedYear === currentYear ? today : format(new Date(selectedYear, 11, 31), 'yyyy-MM-dd')
    return { from, to }
  }, [selectedYear])

  const { projectActivityStats, isLoadingProjectActivityStats } = useGetProjectHeatmap({
    projectId,
    ...dateRange
  })

  const {
    projectActivityStats: currentProjectActivityStats,
    isLoadingProjectActivityStats: isLoadingCurrentProjectActivityStats
  } = useGetProjectHeatmap({
    projectId,
    ...currentDateRange
  })

  const { parentMilestones, isLoadingParentMilestones } = useGetParentMilestones({ projectId })
  const methods = useForm<ProjectTaskStatisticsParams>({
    resolver: zodResolver(projectTaskStatisticsSchema),
    defaultValues: {
      from: startOfMonth(new Date()).toISOString(),
      to: endOfMonth(new Date()).toISOString(),
      isViewInMonth: true,
      parentMilestoneId: null
    }
  })

  const [appliedFilters, setAppliedFilters] = useState<ProjectTaskStatisticsParams>(() => methods.getValues())

  const formFrom = appliedFilters.from ?? dateRange.from
  const formTo = appliedFilters.to ?? dateRange.to
  const formIsViewInMonth = appliedFilters.isViewInMonth
  const formParentMilestoneId = appliedFilters.parentMilestoneId

  const { projectTaskStats, isLoadingProjectTaskStats } = useGetProjectTaskStats({
    projectId,
    from: formFrom,
    to: formTo,
    isViewInMonth: formIsViewInMonth,
    parentMilestoneId: formParentMilestoneId ?? undefined
  })

  const taskStatsChartData = useMemo(() => {
    return (
      projectTaskStats?.map((item) => {
        const start = parseISO(item.startDate)
        const end = parseISO(item.endDate)
        const period = formIsViewInMonth ? format(start, 'MMM') : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`
        return {
          period,
          created: item.totalTasksCreated,
          completed: item.totalTaskCompleted
        }
      }) ?? []
    )
  }, [projectTaskStats, formIsViewInMonth])

  const taskStatsRangeLabel = useMemo(() => {
    const fromLabel = formFrom ? format(parseISO(formFrom), 'MMM d, yyyy') : ''
    const toLabel = formTo ? format(parseISO(formTo), 'MMM d, yyyy') : ''
    const isViewInMonth = formIsViewInMonth ? 'Month' : 'Week'

    const milestone = parentMilestones?.value.items?.find((m) => m.id === formParentMilestoneId)
    const milestoneLabel = milestone ? ` • ${milestone.name}` : ''

    return `${fromLabel} - ${toLabel} (${isViewInMonth})${milestoneLabel}`
  }, [formFrom, formTo, formIsViewInMonth, formParentMilestoneId, parentMilestones])

  const heatmapData = useMemo(() => mapToHeatmapData(projectActivityStats ?? []), [projectActivityStats])
  const totalContributions = useMemo(() => heatmapData.reduce((sum, d) => sum + d.count, 0), [heatmapData])
  const heatmapStartMonth = useMemo(() => new Date(selectedYear, 0, 1), [selectedYear])

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

  const renderTooltip = useCallback(
    (data: CalendarHeatmapData<Omit<ProjectHeatmap, 'statisticDate'>>, date: Date) => {
      const raw = data.raw
      if (!raw || data.count === 0) {
        return (
          <p className='text-xs text-muted-foreground'>
            {t('projectPerformance.tooltipNoActivitiesOn', { date: format(date, 'MMM d, yyyy') })}
          </p>
        )
      }

      const items = [
        { label: t('projectPerformance.tooltipTasksCreated'), value: raw.totalTasksCreated },
        { label: t('projectPerformance.tooltipTasksCompleted'), value: raw.totalTasksCompleted },
        { label: t('projectPerformance.tooltipSubtasksCreated'), value: raw.totalSubtasksCreated },
        { label: t('projectPerformance.tooltipComments'), value: raw.totalCommentsCreated },
        { label: t('projectPerformance.tooltipFilesUploaded'), value: raw.totalFilesUploaded }
      ]

      return (
        <div className='space-y-1'>
          <div>
            <p className='text-xs font-bold'>{format(date, 'MMM d, yyyy')}</p>
            <p className='text-xs text-background/80'>
              {t('projectPerformance.tooltipTotalActivities', { count: data.count })}
            </p>
          </div>

          <div className='border-t border-muted-foreground pt-1 space-y-0.5'>
            {items
              .filter((item) => item.value > 0)
              .map((item) => (
                <div key={item.label} className='flex justify-between gap-4 text-xs'>
                  <p className='text-background/80'>{item.label}</p>
                  <p className='font-medium'>{item.value}</p>
                </div>
              ))}
          </div>
        </div>
      )
    },
    [t]
  )

  const isLoading =
    isLoadingProjectTaskStats ||
    isLoadingProjectActivityStats ||
    isLoadingCurrentProjectActivityStats ||
    isLoadingParentMilestones

  if (isLoading) {
    return (
      <div className='overflow-auto'>
        <div className='max-w-7xl h-full mx-auto pt-6 space-y-6 pb-20'>
          <div>
            <Skeleton className='h-8 w-[250px] mb-2' />
            <Skeleton className='h-4 w-[400px]' />
          </div>

          <div className='space-y-4'>
            <div className='flex flex-wrap gap-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-[116px] flex-1 min-w-[200px] rounded-xl' />
              ))}
            </div>

            <div className='w-full'>
              <Skeleton className='h-[300px] w-full rounded-xl' />
            </div>

            <div className='flex flex-col lg:flex-row gap-4 w-full h-full'>
              <Skeleton className='h-[200px] flex-1 rounded-xl' />
              <Skeleton className='h-[200px] flex-1 rounded-xl' />
            </div>

            <div className='flex flex-col lg:flex-row gap-4 w-full h-full mt-6'>
              <div className='flex-4 space-y-2'>
                <Skeleton className='h-4 w-[200px] mb-2' />
                <Skeleton className='h-[150px] w-full rounded-xl' />
              </div>
              <div className='flex-1 flex flex-col gap-2 mt-6 lg:mt-0'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='h-8 w-full rounded-md' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-auto'>
      <div className='max-w-7xl h-full mx-auto pt-6 space-y-6 pb-20'>
        <div>
          <p className='text-2xl font-bold tracking-tight'>{t('projectPerformance.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('projectPerformance.description')}</p>
        </div>

        {/* Statistics cards */}
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <StatCard
                title={t('projectPerformance.statTasks')}
                value={currentProjectActivityStats?.[0]?.totalTasksCreated ?? 0}
                icon={<LayersPlus className='size-4.5 text-white' />}
                color='slate'
                trendValue={3}
                trendDirection='down'
              />
            </div>

            <div className='flex-1 min-w-[200px]'>
              <StatCard
                title={t('projectPerformance.statSubtasks')}
                value={currentProjectActivityStats?.[0]?.totalSubtasksCreated ?? 0}
                icon={<ListTreeIcon className='size-4.5 text-white' />}
                color='orange'
                trendValue={2}
                trendDirection='up'
              />
            </div>

            <div className='flex-1 min-w-[200px]'>
              <StatCard
                title={t('projectPerformance.statCompleted')}
                value={currentProjectActivityStats?.[0]?.totalTasksCompleted ?? 0}
                icon={<CircleCheckBigIcon className='size-4.5 text-white' />}
                color='green'
                trendValue={4}
                trendDirection='up'
              />
            </div>

            <div className='flex-1 min-w-[200px]'>
              <StatCard
                title={t('projectPerformance.statComments')}
                value={currentProjectActivityStats?.[0]?.totalCommentsCreated ?? 0}
                icon={<MessageCircleIcon className='size-4.5 text-white' />}
                color='blue'
                trendValue={12}
                trendDirection='up'
              />
            </div>

            <div className='flex-1 min-w-[200px]'>
              <StatCard
                title={t('projectPerformance.statFiles')}
                value={currentProjectActivityStats?.[0]?.totalFilesUploaded ?? 0}
                icon={<PaperclipIcon className='size-4.5 text-white' />}
                color='purple'
                trendValue={0}
                trendDirection='neutral'
              />
            </div>
          </div>

          {/* Bar chart */}
          <div className='w-full'>
            <Card className='p-4 shadow-none gap-4'>
              <div className='flex justify-between items-start gap-2'>
                <div>
                  <p className='font-semibold'>{t('projectPerformance.taskStatistics')}</p>
                  <p className='text-xs text-muted-foreground'>{taskStatsRangeLabel}</p>
                </div>

                <FormProvider {...methods}>
                  <ProjectTaskStatsPopover
                    parentMilestones={parentMilestones?.value.items ?? []}
                    onApplyFilters={setAppliedFilters}
                  />
                </FormProvider>
              </div>

              {isLoading}
              {taskStatsChartData.length > 0 ? (
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
                <p className='text-sm text-muted-foreground'>{t('projectPerformance.noTaskStatistics')}</p>
              )}

              <div className='flex flex-col items-start gap-1'>
                <div className='flex gap-2 leading-none font-medium text-sm'>
                  {(t as (key: string, options?: Record<string, string | number>) => string)(
                    'projectPerformance.trendingUp',
                    { value: 5.2 }
                  )}{' '}
                  <TrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground leading-none text-xs'>
                  {(t as (key: string, options?: Record<string, string | number>) => string)(
                    'projectPerformance.showingVisitors',
                    { months: 6 }
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className='flex flex-col lg:flex-row gap-4 w-full h-full'>
            <div className='flex-1'>
              <BarChartHorizontal />
            </div>
            <div className='flex-1'>
              <BarChartHorizontal />
            </div>
          </div>

          {/* Contributions heatmap */}
          <div className='flex flex-col lg:flex-row gap-4 w-full h-full mt-6'>
            <div className='flex-4 space-y-2'>
              <p className='text-sm text-muted-foreground'>
                {(t as (key: string, options?: Record<string, string | number>) => string)(
                  'projectPerformance.contributions',
                  { count: totalContributions, year: selectedYear }
                )}
              </p>
              <Heatmap data={heatmapData} renderTooltip={renderTooltip} startMonth={heatmapStartMonth} />
            </div>

            <div className='flex-1 flex flex-col gap-2 mt-6 lg:mt-0'>
              {YEAR_OPTIONS.map((year) => (
                <Button
                  key={year}
                  className='justify-start'
                  variant={year === selectedYear ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setSelectedYear(year)}
                >
                  <span className='text-xs font-normal'>{year}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
