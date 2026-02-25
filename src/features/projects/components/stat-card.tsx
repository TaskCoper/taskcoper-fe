import { Card } from '@/components/ui/card'
import { EqualIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type StatColor = 'blue' | 'green' | 'emerald' | 'teal' | 'red' | 'orange' | 'purple' | 'slate'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: StatColor
  trendValue?: string | number
  trendLabel?: string
  trendDirection?: 'up' | 'down' | 'neutral'
}

const gradientMap: Record<StatColor, string> = {
  blue: 'bg-linear-to-b from-blue-400 via-blue-600/80 to-blue-700',
  green: 'bg-linear-to-b from-green-400 via-green-600/80 to-green-700',
  emerald: 'bg-linear-to-b from-emerald-400 via-emerald-600/80 to-emerald-700',
  teal: 'bg-linear-to-b from-teal-400 via-teal-600/80 to-teal-700',
  red: 'bg-linear-to-b from-red-400 via-red-600/80 to-red-700',
  orange: 'bg-linear-to-b from-orange-400 via-orange-600/80 to-orange-700',
  purple: 'bg-linear-to-b from-purple-400 via-purple-600/80 to-purple-700',
  slate: 'bg-linear-to-b from-slate-400 via-slate-600/80 to-slate-700'
}

export default function StatCard({
  title,
  value,
  icon,
  color = 'blue',
  trendValue,
  trendLabel,
  trendDirection = 'up'
}: StatCardProps) {
  const { t } = useTranslation()
  const resolvedTrendLabel = trendLabel ?? t('projectPerformance.trendLabel')
  const getTrendDetails = () => {
    switch (trendDirection) {
      case 'up':
        return {
          bgClass: 'bg-green-100',
          iconClass: 'text-green-600',
          textClass: 'text-green-500',
          Icon: TrendingUpIcon
        }
      case 'down':
        return { bgClass: 'bg-red-100', iconClass: 'text-red-600', textClass: 'text-red-500', Icon: TrendingDownIcon }
      case 'neutral':
      default:
        return { bgClass: 'bg-gray-100', iconClass: 'text-gray-600', textClass: 'text-gray-500', Icon: EqualIcon }
    }
  }

  const { bgClass, textClass, iconClass, Icon: TrendIcon } = getTrendDetails()
  const iconGradient = gradientMap[color] || gradientMap.blue

  return (
    <Card className='bg-muted/50 p-1 gap-0 shadow-none'>
      <Card className='rounded-lg p-3 gap-4'>
        <div className={`size-9 shadow-xs rounded-lg flex items-center justify-center ${iconGradient}`}>{icon}</div>

        <div className='-space-y-0.5'>
          <p className='text-sm text-muted-foreground'>{title}</p>
          <p className='text-xl font-bold font-mono'>{value}</p>
        </div>
      </Card>

      {trendValue !== undefined && (
        <div className='px-1 pt-2 pb-1 flex items-center gap-1'>
          <div className={`size-5 rounded-full flex items-center justify-center ${bgClass}`}>
            <TrendIcon className={`size-3.5 ${iconClass}`} />
          </div>

          <p className={`text-sm font-semibold ${textClass}`}>{trendValue}</p>
          <p className='text-sm text-muted-foreground'>{resolvedTrendLabel}</p>
        </div>
      )}
    </Card>
  )
}
