import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronLeftIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteTask } from '../hooks/use-delete-task'
import { cn } from '@/shared/utils'

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
    setIsDeleting(false)
    setOpen(false)
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
            <div className='grid grid-cols-3 items-center'>
              <Button variant='ghost' size='icon-sm' onClick={() => setIsDeleting(false)}>
                <ChevronLeftIcon />
              </Button>
              <p className='text-sm font-bold text-center'>{t('task.deleteTask.title')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='ml-auto'>
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
              <Trash2Icon />
              <p>{t('common.button.delete')}</p>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
