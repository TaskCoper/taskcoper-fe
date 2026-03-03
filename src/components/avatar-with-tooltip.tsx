import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, getAvatarFallback } from '@/shared/utils'

interface AvatarWithTooltipProps {
  avatar?: string | null
  fullName: string
  email: string
  className?: string
  fallbackClassName?: string
  isActive?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function AvatarWithTooltip({
  avatar,
  fullName,
  email,
  className,
  fallbackClassName,
  isActive,
  onMouseEnter,
  onMouseLeave
}: AvatarWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn('size-6', isActive && 'z-10 scale-110', 'transition-transform', className)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <AvatarImage src={avatar || ''} alt={fullName} />
          <AvatarFallback className={fallbackClassName}>{getAvatarFallback(fullName)}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p className='font-medium'>{fullName}</p>
        <p className='text-xs text-muted-foreground'>{email}</p>
      </TooltipContent>
    </Tooltip>
  )
}
