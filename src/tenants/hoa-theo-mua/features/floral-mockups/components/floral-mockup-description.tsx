import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLayoutEffect, useRef, useState } from 'react'

const FloralMockupDescription = ({ description, emptyLabel }: { description: string | null; emptyLabel: string }) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const normalizedDescription = description?.trim()

  useLayoutEffect(() => {
    const element = descriptionRef.current
    if (!element || !normalizedDescription) return

    const updateTruncation = () => {
      setIsTruncated(element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
    }

    updateTruncation()
    const resizeObserver = new ResizeObserver(updateTruncation)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [normalizedDescription])

  if (!normalizedDescription) return <span className='text-sm italic text-muted-foreground'>{emptyLabel}</span>

  const content = (
    <p ref={descriptionRef} className='line-clamp-2 max-w-96 text-sm leading-5'>
      {normalizedDescription}
    </p>
  )

  if (!isTruncated) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side='bottom'
        align='start'
        sideOffset={8}
        className='max-w-sm rounded-xl border bg-popover px-3 py-2 text-sm leading-relaxed text-popover-foreground shadow-xl'
        arrowClassName='bg-popover fill-popover'
      >
        {normalizedDescription}
      </TooltipContent>
    </Tooltip>
  )
}

export default FloralMockupDescription
