import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/utils'
import { FileTextIcon } from 'lucide-react'
import { useRef, useState } from 'react'

interface VoucherDescriptionProps {
  description: string | null | undefined
  label: string
  emptyLabel?: string
  className?: string
}

export function VoucherDescription({ description, label, emptyLabel, className }: VoucherDescriptionProps) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const text = description?.trim()

  if (!text) return emptyLabel ? <span className='text-sm text-muted-foreground'>{emptyLabel}</span> : null

  const handleOpenChange = (nextOpen: boolean) => {
    const element = textRef.current
    setOpen(nextOpen && !!element && element.scrollWidth > element.clientWidth)
  }

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <div className='w-80 max-w-full overflow-hidden'>
          <p ref={textRef} className={cn('truncate leading-5', className)}>
            {text}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side='bottom'
        align='start'
        sideOffset={8}
        className='w-80 rounded-xl border bg-popover p-0 text-popover-foreground shadow-xl'
        arrowClassName='bg-popover fill-popover'
      >
        <div className='overflow-hidden rounded-xl'>
          <div className='flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5'>
            <span className='flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary'>
              <FileTextIcon className='size-3.5' aria-hidden='true' />
            </span>
            <span className='text-sm font-semibold'>{label}</span>
          </div>
          <p className='whitespace-normal break-words p-3 text-sm leading-5 [overflow-wrap:anywhere]'>{text}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
