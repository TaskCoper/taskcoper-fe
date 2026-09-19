import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/utils'
import { FileTextIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

export default function CardTemplateDescription({
  description,
  emptyLabel,
  label
}: {
  description: string | null
  emptyLabel: string
  label: string
}) {
  const [isTruncated, setIsTruncated] = useState(false)
  const measureDescription = useCallback((node: HTMLParagraphElement | null) => {
    if (!node) return

    const updateTruncation = () => setIsTruncated(node.scrollHeight > node.clientHeight)
    const observer = new ResizeObserver(updateTruncation)

    updateTruncation()
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  if (!description?.trim()) return <span className='text-sm italic text-muted-foreground'>{emptyLabel}</span>

  const descriptionText = (
    <div className='w-72 max-w-full overflow-hidden'>
      <p
        ref={measureDescription}
        className={cn(
          'line-clamp-2 whitespace-normal break-words text-sm leading-5 [overflow-wrap:anywhere]',
          isTruncated && 'cursor-help'
        )}
      >
        {description}
      </p>
    </div>
  )

  if (!isTruncated) return descriptionText

  return (
    <Tooltip>
      <TooltipTrigger asChild>{descriptionText}</TooltipTrigger>
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
          <p className='whitespace-normal break-words p-3 text-sm leading-5 [overflow-wrap:anywhere]'>{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
