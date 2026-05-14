import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

interface BarChartHorizontalProps {
  data: Record<string, string | number | null>[]
  config: ChartConfig
  dataKey: string
  xAxisKey: string
  title: string
  description?: string
  trendValue?: number
  trendText?: string
  color?: string
  menu?: React.ReactNode
}

const CustomYAxisTick = (props: {
  x: number
  y: number
  payload: { value: string | number }
  data: Record<string, string | number | null>[]
}) => {
  const { x, y, payload, data } = props
  const item = data.find((d) => d.name === payload.value)
  const fallback = typeof payload.value === 'string' ? payload.value.slice(0, 2).toUpperCase() : 'U'

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-190} y={-20} width={180} height={40}>
        <div className='flex items-center gap-3'>
          <Avatar className='size-7 shrink-0'>
            {item?.avatar && <AvatarImage src={item.avatar as string} alt={payload.value as string} />}
            <AvatarFallback className='text-xs'>{fallback}</AvatarFallback>
          </Avatar>

          <div className='flex flex-col min-w-0'>
            <p className='text-sm font-medium truncate' title={payload.value as string}>
              {payload.value}
            </p>
            {item?.email && (
              <p className='text-xs text-muted-foreground truncate' title={item.email as string}>
                {item.email as string}
              </p>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  )
}

export default function BarChartHorizontal({
  data,
  config,
  dataKey,
  xAxisKey,
  title,
  description,
  trendValue,
  trendText,
  color,
  menu
}: BarChartHorizontalProps) {
  const { t } = useTranslation()

  return (
    <Card className='p-4 shadow-none gap-4 flex flex-col h-full'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='font-semibold'>{title}</p>
          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>

        {menu}
      </div>
      <CardContent className='flex-1 pb-0 pl-0'>
        {data.length > 0 ? (
          <ChartContainer config={config} className='max-h-55 w-full'>
            <BarChart
              accessibilityLayer
              data={data}
              layout='vertical'
              margin={{
                left: 30,
                right: 0,
                top: 0,
                bottom: 0
              }}
              barCategoryGap={8}
            >
              <XAxis type='number' dataKey={dataKey} hide />
              <YAxis
                dataKey={xAxisKey}
                type='category'
                tickLine={false}
                tickMargin={2}
                axisLine={false}
                width={180}
                tick={({ x, y, payload }) => <CustomYAxisTick x={x} y={y} payload={payload} data={data} />}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel className='min-w-40' />} />
              <Bar dataKey={dataKey} fill={color} radius={5} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className='flex items-center justify-center h-45'>
            <p className='text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
          </div>
        )}
      </CardContent>

      {(trendValue !== undefined || trendText) && (
        <div className='flex flex-col items-start gap-1 mt-auto'>
          {trendValue !== undefined && (
            <div className='flex gap-2 font-medium text-sm'>
              {trendText}
              <TrendingUp className='size-4' />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
