import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/shared/utils'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'

export interface BreakdownRow {
  key: string
  label: string
  total: number
  color?: string
}

// Thanh ngang chứ không phải hình tròn: so độ dài dễ hơn so góc rất nhiều, và nhãn kênh dài
// nằm ngang mới đọc được. Danh tính do nhãn trục mang nên một màu là đủ.
const MarketingReportBreakdownChart = ({ rows, emptyLabel }: { rows: BreakdownRow[]; emptyLabel: string }) => {
  const chartConfig = { total: { label: 'total', color: 'var(--chart-2)' } } satisfies ChartConfig
  const hasData = rows.some((row) => row.total > 0)

  if (!hasData) {
    return (
      <div className='flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground'>
        {emptyLabel}
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={cn('aspect-auto w-full')} style={{ height: rows.length * 44 + 16 }}>
      <BarChart data={rows} layout='vertical' margin={{ left: 4, right: 32 }}>
        <XAxis type='number' hide allowDecimals={false} />
        <YAxis
          type='category'
          dataKey='label'
          tickLine={false}
          axisLine={false}
          width={96}
          tickMargin={8}
          className='text-xs'
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent hideLabel formatter={(value) => <span className='tabular-nums'>{value}</span>} />
          }
        />
        <Bar dataKey='total' radius={4} barSize={18} fill='var(--color-total)'>
          {/* Biểu đồ trạng thái mượn đúng bộ màu của badge ở bảng danh sách, nhìn là khớp ngay.
              Không truyền màu thì cả loạt dùng chung một tông, danh tính do nhãn trục mang. */}
          {rows.map((row) => (
            <Cell key={row.key} fill={row.color ?? 'var(--color-total)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default MarketingReportBreakdownChart
