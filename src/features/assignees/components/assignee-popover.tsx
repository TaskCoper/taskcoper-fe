import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AssigneePopoverProps {
  children: React.ReactNode
}

export default function AssigneePopover({ children }: AssigneePopoverProps) {
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
        sideOffset={8}
        onInteractOutside={handleClose}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.assignee.assignee')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <div className='space-y-3'>
            <Input placeholder={t('task.assignee.findAssignee')} autoFocus />

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-foreground/60'>{t('task.assignee.boardAssignee')}</p>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 hover:bg-muted cursor-pointer rounded-sm p-1'>
                  <Avatar>
                    <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='text-foreground/80'>Danh Nguyen</p>
                </div>

                <div className='flex items-center gap-2 hover:bg-muted cursor-pointer rounded-sm p-1'>
                  <Avatar>
                    <AvatarImage src='https://github.com/evilrabbit.png' alt='@evilrabbit' />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <p className='text-foreground/80'>Nguyen Danh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
