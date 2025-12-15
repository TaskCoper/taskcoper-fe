import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { PencilIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../constants'

interface LabelPopoverProps {
  children: React.ReactNode
}

const defaultDisplayLabels = sortedTaskLabelColors
  .map((color) => color.shades.find((shade) => shade.isDefaultDisplay))
  .filter((label) => label !== undefined)
  .slice(0, 6)

export default function LabelPopover({ children }: LabelPopoverProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 max-h-[420px] overflow-auto'
        onInteractOutside={handleClose}
        sideOffset={8}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.label.label')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <Input placeholder={t('task.label.findLabel')} />

          <div className='flex flex-col gap-2'>
            <p className='text-sm font-bold w-full text-foreground/60'>{t('task.label.label')}</p>

            <div className='space-y-1'>
              {defaultDisplayLabels.map((label) => (
                <div key={label.value} className='flex items-center gap-2'>
                  <Checkbox />
                  <div className={cn(label.value, 'w-full h-8 rounded-sm')} />
                  <PencilIcon className='size-4' />
                </div>
              ))}
            </div>

            <Button variant='secondary' className='w-full mt-2'>
              {t('task.label.createLabel')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
