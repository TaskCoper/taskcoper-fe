import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskPriority, TaskPriorityLabel } from '@/types/task.type'
import { ChevronDownIcon, ChevronsDownIcon, ChevronsUpIcon, ChevronUpIcon, EqualIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PriorityPopoverProps {
  children: React.ReactNode
}

const TaskPriorityIcon: Record<TaskPriority, React.ReactNode> = {
  [TaskPriority.LOWEST]: <ChevronsDownIcon className='size-4 text-blue-500' />,
  [TaskPriority.LOW]: <ChevronDownIcon className='size-4 text-blue-500' />,
  [TaskPriority.MEDIUM]: <EqualIcon className='size-4 text-orange-500' />,
  [TaskPriority.HIGH]: <ChevronUpIcon className='size-4 text-rose-500' />,
  [TaskPriority.HIGHEST]: <ChevronsUpIcon className='size-4 text-rose-500' />
}

export default function PriorityPopover({ children }: PriorityPopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-80 overflow-y-auto'
        onInteractOutside={onClose}
        sideOffset={8}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.priority.title')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={onClose} />
          </div>

          <Select>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('task.priority.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(TaskPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <div className='flex items-center gap-2'>
                      {TaskPriorityIcon[priority as TaskPriority]}
                      {t(TaskPriorityLabel[priority as TaskPriority])}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className='flex justify-end items-center gap-2'>
            <Button variant='ghost'>{t('common.button.remove')}</Button>
            <Button>{t('common.button.save')}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
