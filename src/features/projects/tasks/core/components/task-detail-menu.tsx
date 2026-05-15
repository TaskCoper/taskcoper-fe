import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronLeftIcon, CopyIcon, EyeIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetMyProjectPermissions } from '../../../roles/hooks/use-get-my-project-permissions'
import { useDeleteTask } from '../hooks/use-delete-task'
import { useToggleWatchTask } from '../hooks/use-toggle-watch-task'

interface TaskDetailMenuProps {
  taskId: string
  projectIdentifier: string
  milestoneId: string
  parentMilestoneIdentifier: string
  taskName: string
  children: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  onDeleteSuccess: () => void
  isWatchingTask: boolean
}

export default function TaskDetailMenu({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  milestoneId,
  taskName,
  children,
  open,
  setOpen,
  onDeleteSuccess,
  isWatchingTask
}: TaskDetailMenuProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canDelete = check('TASKS', 'canDelete')
  const canUpdate = check('TASKS', 'canUpdate')

  const { toggleWatchTask } = useToggleWatchTask({ projectIdentifier, milestoneIdentifier: parentMilestoneIdentifier })
  const { deleteTask } = useDeleteTask({ projectIdentifier, parentMilestoneIdentifier, milestoneId, onDeleteSuccess })

  const handleToggleWatchTask = () => {
    toggleWatchTask({ taskId, isWatching: !isWatchingTask })
  }

  const handleCopyLink = async () => {
    const baseUrl = window.location.origin
    const taskUrl = `${baseUrl}/projects/${projectIdentifier}/milestones/${parentMilestoneIdentifier}/tasks/${taskId}`

    try {
      await navigator.clipboard.writeText(taskUrl)
      toast.success(t('task.copyLink.success'), {
        description: t('task.copyLink.successDescription')
      })
      onClose()
    } catch {
      toast.error(t('task.copyLink.error'), {
        description: t('task.copyLink.errorDescription')
      })
    }
  }

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
            {canUpdate ? (
              <Button
                size='sm'
                className='w-full justify-start gap-2 rounded-none'
                variant='ghost'
                onClick={handleToggleWatchTask}
              >
                <EyeIcon />
                <p>{t('task.column.watching')}</p>

                {isWatchingTask ? (
                  <>
                    <div className='flex-1' />
                    <div className='size-4 bg-lime-600 rounded-sm flex items-center justify-center'>
                      <CheckIcon className='size-3 text-white' />
                    </div>
                  </>
                ) : null}
              </Button>
            ) : null}

            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              onClick={handleCopyLink}
            >
              <CopyIcon />
              <p>{t('task.copyLink.title')}</p>
            </Button>

            {canDelete ? (
              <Button
                size='sm'
                className='w-full justify-start gap-2 rounded-none'
                variant='ghost'
                onClick={() => setIsDeleting(true)}
              >
                <Trash2Icon className='text-destructive' />
                <p className='text-destructive'>{t('common.button.delete')}</p>
              </Button>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
