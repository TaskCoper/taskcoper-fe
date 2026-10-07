import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/shared/utils'
import type { LucideIcon } from 'lucide-react'

// Một con số thì đọc thẳng nhanh hơn mọi biểu đồ, nên phần tổng quan để dạng thẻ số.
const MarketingReportStatTile = ({
  label,
  value,
  footnote,
  icon: Icon,
  accentClassName
}: {
  label: string
  // Null là nền tảng không trả dữ liệu, khác với 0
  value: number | null
  footnote?: string
  icon: LucideIcon
  accentClassName?: string
}) => {
  return (
    <Card className='gap-0 py-4'>
      <CardContent className='px-4'>
        <div className='flex items-center gap-2'>
          <Icon className={cn('size-4', accentClassName ?? 'text-muted-foreground')} />
          <p className='text-xs text-muted-foreground'>{label}</p>
        </div>

        {/* Chỉ số nền tảng thường tới hàng nghìn, không tách nhóm thì đọc rất dễ nhầm */}
        <p className='mt-2 text-2xl font-bold tabular-nums'>{value === null ? '-' : value.toLocaleString()}</p>
        {footnote && <p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>{footnote}</p>}
      </CardContent>
    </Card>
  )
}

export default MarketingReportStatTile
