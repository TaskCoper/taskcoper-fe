import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useDateFormat } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { MarketingReportDailyPoint } from '../types'

// Một series duy nhất nên không cần bảng màu phân loại: danh tính đã nằm ở tiêu đề biểu đồ.
const chartConfig = {
  reach: { label: 'reach', color: 'var(--chart-2)' }
} satisfies ChartConfig

const MarketingReportTimelineChart = ({ data }: { data: MarketingReportDailyPoint[] }) => {
  const { t } = useTenantTranslation()
  const { formatDate } = useDateFormat()

  // Khoảng 90 ngày mà dán nhãn từng ngày thì chữ chồng lên nhau, nên giãn mốc theo độ dài chuỗi
  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1)

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-64 w-full'>
      <BarChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis
          dataKey='date'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={tickInterval}
          tickFormatter={(value: string) => formatDate(value, 'dayMonth')}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
          // Hàng nghìn mà in đủ số thì trục chiếm hết chỗ, rút gọn về dạng 4,2K
          tickFormatter={(value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => formatDate(String(payload?.[0]?.payload?.date), 'dateMedium')}
              formatter={(value) => (
                <span className='tabular-nums'>
                  {t('marketingReports.chart.reachValue', { reach: Number(value).toLocaleString() })}
                </span>
              )}
            />
          }
        />
        <Bar dataKey='reach' fill='var(--color-reach)' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export default MarketingReportTimelineChart
