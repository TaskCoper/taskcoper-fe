import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SubtaskPopoverProps {
  children: React.ReactNode
}

export default function SubtaskPopover({ children }: SubtaskPopoverProps) {
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
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.subtask.subtaskTitle')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='subtask-title' className='font-semibold text-foreground/60'>
              {t('task.subtask.title')}
            </Label>
            <Input id='subtask-title' defaultValue={t('task.subtask.subtask')} autoFocus />
            <Button>{t('task.subtask.addSubtask')}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
