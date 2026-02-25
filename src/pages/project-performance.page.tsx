import Heatmap, { type CalendarHeatmapData } from '@/components/heatmap'
import { Button } from '@/components/ui/button'
import StatCard from '@/features/projects/components/stat-card'
import { useGetProjectHeatmap } from '@/features/projects/hooks/use-get-project-heatmap'
import type { ProjectHeatmap } from '@/types/efficiency.type'
import { format, getYear } from 'date-fns'
import { CircleCheckBigIcon, LayersPlus, ListTreeIcon, MessageCircleIcon, PaperclipIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

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

const currentDateRange = {
  from: new Date().toISOString(),
  to: new Date().toISOString()
}

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function ProjectPerformancePage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const dateRange = useMemo(() => {
    const from = new Date(selectedYear, 0, 1).toISOString()
    const to =
      selectedYear === currentYear ? new Date().toISOString() : new Date(selectedYear, 11, 31, 23, 59, 59).toISOString()
    return { from, to }
  }, [selectedYear])

  const { projectActivityStats } = useGetProjectHeatmap({
    projectId,
    ...dateRange
  })

  const { projectActivityStats: currentProjectActivityStats } = useGetProjectHeatmap({
    projectId,
    ...currentDateRange
  })

  const heatmapData = useMemo(() => mapToHeatmapData(projectActivityStats ?? []), [projectActivityStats])
  const totalContributions = useMemo(() => heatmapData.reduce((sum, d) => sum + d.count, 0), [heatmapData])
  const heatmapStartMonth = useMemo(() => new Date(selectedYear, 0, 1), [selectedYear])

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

  return (
    <div className='w-full h-full p-6 space-y-6'>
      <div>
        <p className='text-2xl font-bold tracking-tight'>{t('projectPerformance.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('projectPerformance.description')}</p>
      </div>

      <div className='space-y-10'>
        <div className='grid grid-cols-10 gap-4'>
          <div className='col-span-2'>
            <StatCard
              title={t('projectPerformance.statTasks')}
              value={currentProjectActivityStats?.[0]?.totalTasksCreated ?? 0}
              icon={<LayersPlus className='size-5 text-white' />}
              color='slate'
              trendValue={3}
              trendDirection='down'
            />
          </div>

          <div className='col-span-2'>
            <StatCard
              title={t('projectPerformance.statSubtasks')}
              value={currentProjectActivityStats?.[0]?.totalSubtasksCreated ?? 0}
              icon={<ListTreeIcon className='size-5 text-white' />}
              color='orange'
              trendValue={2}
              trendDirection='up'
            />
          </div>

          <div className='col-span-2'>
            <StatCard
              title={t('projectPerformance.statCompleted')}
              value={currentProjectActivityStats?.[0]?.totalTasksCompleted ?? 0}
              icon={<CircleCheckBigIcon className='size-5 text-white' />}
              color='green'
              trendValue={4}
              trendDirection='up'
            />
          </div>

          <div className='col-span-2'>
            <StatCard
              title={t('projectPerformance.statComments')}
              value={currentProjectActivityStats?.[0]?.totalCommentsCreated ?? 0}
              icon={<MessageCircleIcon className='size-5 text-white' />}
              color='blue'
              trendValue={12}
              trendDirection='up'
            />
          </div>

          <div className='col-span-2'>
            <StatCard
              title={t('projectPerformance.statFiles')}
              value={currentProjectActivityStats?.[0]?.totalFilesUploaded ?? 0}
              icon={<PaperclipIcon className='size-5 text-white' />}
              color='purple'
              trendValue={0}
              trendDirection='neutral'
            />
          </div>
        </div>

        <div className='grid grid-cols-10 gap-4 w-full h-full'>
          <div className='col-span-8 space-y-2'>
            <p className='text-sm text-muted-foreground'>
              {(t as (key: string, options?: Record<string, string | number>) => string)(
                'projectPerformance.contributions',
                { count: totalContributions, year: selectedYear }
              )}
            </p>
            <Heatmap data={heatmapData} renderTooltip={renderTooltip} startMonth={heatmapStartMonth} />
          </div>

          <div className='col-span-2 flex flex-col gap-2'>
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
  )
}
