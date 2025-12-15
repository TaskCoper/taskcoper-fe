import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AttachmentPopoverProps {
  children: React.ReactNode
}

export default function AttachmentPopover({ children }: AttachmentPopoverProps) {
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
        className='p-0 min-w-80 overflow-auto'
        sideOffset={8}
        onInteractOutside={handleClose}
      >
        <div className='p-4 flex flex-col gap-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.attachment.attachment')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-semibold text-foreground/60'>{t('task.attachment.attachmentTitle')}</p>
            <p className='text-xs text-muted-foreground'>{t('task.attachment.attachmentDescription')}</p>
            <Button variant='secondary' className='w-full'>
              {t('task.attachment.chooseAttachment')}
            </Button>
          </div>

          <Separator />

          <div className='space-y-1'>
            <Label htmlFor='attachment-value'>
              <span>
                {' '}
                {t('task.attachment.attachmentValue')}
                <span className='text-destructive font-semibold'>*</span>
              </span>
            </Label>
            <Input id='attachment-value' placeholder={t('task.attachment.attachmentValuePlaceholder')} />
          </div>

          <div className='space-y-1'>
            <Label htmlFor='attachment-display'>{t('task.attachment.attachmentDisplay')}</Label>
            <Input id='attachment-display' placeholder={t('task.attachment.attachmentDisplayPlaceholder')} />
            <p className='text-xs text-muted-foreground'>{t('task.attachment.attachmentDisplayDescription')}</p>
          </div>

          <div className='space-x-2 ml-auto mt-2'>
            <Button variant='secondary'>{t('task.attachment.cancel')}</Button>
            <Button>{t('task.attachment.insert')}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
