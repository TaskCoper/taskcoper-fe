import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import type { NewsSource } from '../types'

interface NewsSourceRowProps {
  source: NewsSource
  publishedAt: string
  size?: 'sm' | 'md'
  className?: string
}

export function NewsSourceRow({ source, publishedAt, size = 'sm', className }: NewsSourceRowProps) {
  const { formatRelative } = useDateFormat()
  const avatarSize = size === 'md' ? 'size-6' : 'size-5'
  const nameSize = size === 'md' ? 'text-xs' : 'text-[11px]'

  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <Avatar className={cn(avatarSize)}>
        {source.logoUrl ? <AvatarImage src={source.logoUrl} alt={source.name} /> : null}
        <AvatarFallback className={cn('text-[9px] font-semibold tracking-tight', source.accentClassName)}>
          {source.fallback}
        </AvatarFallback>
      </Avatar>
      <span className={cn(nameSize, 'font-semibold text-foreground')}>{source.shortName}</span>
      <span className='size-0.5 rounded-full bg-muted-foreground/40' aria-hidden />
      <span className={cn(nameSize)}>{formatRelative(publishedAt)}</span>
    </div>
  )
}
