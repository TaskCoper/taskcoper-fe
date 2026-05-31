import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { softInsetSurfaceClasses } from '@/shared/effects'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Pie, PieChart } from 'recharts'

interface PieChartLabelProps {
  data: Record<string, string | number | null>[]
  config: ChartConfig
  dataKey: string
  nameKey: string
  title: string
  description?: string
  trendValue?: number
  trendText?: string
  menu?: React.ReactNode
}

export default function PieChartLabel({
  data,
  config,
  dataKey,
  nameKey,
  title,
  description,
  trendValue,
  trendText,
  menu
}: PieChartLabelProps) {
  const { t } = useTranslation()

  return (
    <Card className={`${softInsetSurfaceClasses} flex flex-col h-full p-4 gap-4`}>
      <div className='flex items-start justify-between'>
        <div className='flex flex-col items-start pb-0'>
          <p className='font-semibold'>{title}</p>
          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>

        {menu}
      </div>

      <CardContent className='flex-1 pb-0 px-0'>
        {data.length > 0 ? (
          <ChartContainer
            config={config}
            className='[&_.recharts-pie-label-text]:fill-foreground mx-auto max-h-55 pb-0'
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel className='min-w-40' />} />
              <Pie data={data} dataKey={dataKey} label nameKey={nameKey} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className='flex items-center justify-center h-50'>
            <p className='text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
          </div>
        )}
      </CardContent>

      {(trendValue !== undefined || trendText) && (
        <div className='flex flex-col items-start gap-1 mt-auto'>
          {trendValue !== undefined && (
            <div className='flex gap-2 leading-none font-medium text-sm'>
              {trendText}
              <TrendingUp className='size-4' />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
