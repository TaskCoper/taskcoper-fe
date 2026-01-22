import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { ChevronLeftIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteTask } from '../hooks/use-delete-task'

interface TaskDetailMenuProps {
  taskId: string
  projectId: string
  parentMilestoneId: string
  taskName: string
  children: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  onDeleteSuccess: () => void
}

export default function TaskDetailMenu({
  taskId,
  projectId,
  parentMilestoneId,
  taskName,
  children,
  open,
  setOpen,
  onDeleteSuccess
}: TaskDetailMenuProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  const { deleteTask } = useDeleteTask({ projectId, parentMilestoneId, onDeleteSuccess })

  const onClose = () => {
    setOpen(false)
    setTimeout(() => {
      setIsDeleting(false)
    }, 300)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('p-0', isDeleting ? 'w-72' : 'w-52')}
        side='bottom'
        align='end'
        sideOffset={8}
        onInteractOutside={onClose}
      >
        {isDeleting ? (
          <div className='p-3 space-y-2'>
            <div className='flex items-center justify-center relative mt-1'>
              <Button variant='ghost' size='icon-sm' onClick={() => setIsDeleting(false)} className='absolute left-0'>
                <ChevronLeftIcon />
              </Button>
              <p className='text-sm font-bold whitespace-nowrap'>{t('task.deleteTask.title')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                <XIcon />
              </Button>
            </div>

            <p className='text-sm text-muted-foreground'>{t('task.deleteTask.description', { taskName })}</p>

            <Button
              className='w-full mt-2'
              variant='destructive'
              onClick={() => {
                deleteTask({ taskId })
                onClose()
              }}
            >
              {t('task.deleteTask.confirmText')}
            </Button>
          </div>
        ) : (
          <div className='py-2'>
            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              onClick={() => setIsDeleting(true)}
            >
              <Trash2Icon className='text-destructive' />
              <p className='text-destructive'>{t('common.button.delete')}</p>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
