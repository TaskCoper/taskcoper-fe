import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

export const description = 'A horizontal bar chart'

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 }
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

export default function BarChartHorizontal() {
  const { t } = useTranslation()

  return (
    <Card className='p-4 shadow-none gap-4'>
      <div>
        <p className='font-semibold'>{t('projectPerformance.taskStatistics')}</p>
        <p className='text-xs text-muted-foreground'>Text</p>
      </div>
      <CardContent>
        <ChartContainer config={chartConfig} className='max-h-36'>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout='vertical'
            margin={{
              left: -20
            }}
          >
            <XAxis type='number' dataKey='desktop' hide />
            <YAxis
              dataKey='month'
              type='category'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='desktop' fill='var(--color-desktop)' radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <div className='flex flex-col items-start gap-1'>
        <div className='flex gap-2 leading-none font-medium text-sm'>
          {(t as (key: string, options?: Record<string, string | number>) => string)('projectPerformance.trendingUp', {
            value: 5.2
          })}{' '}
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
  )
}
