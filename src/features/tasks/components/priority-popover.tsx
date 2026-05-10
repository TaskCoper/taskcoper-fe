import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { TaskPriority, TaskPriorityLabel } from '@/types/task.type'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { getTaskPriorityIcon } from '../constants'

interface PriorityPopoverProps {
  children: React.ReactNode
  onSubmit: () => void
  onRemove: () => void
  disabled?: boolean
}

export default function PriorityPopover({ children, onSubmit, onRemove, disabled = false }: PriorityPopoverProps) {
  const { t } = useTranslation()
  const { identifier } = useParams<{ identifier: string }>()

  const [open, setOpen] = useState(false)
  const {
    watch,
    setValue,
    reset,
    formState: { isDirty }
  } = useFormContext()
  const priority = watch('priority') as TaskPriority | null

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canDelete = check('TASKS', 'canDelete')

  const handleSave = () => {
    onSubmit()
    setOpen(false)
  }

  const handleRemove = () => {
    setValue('priority', null)
    onRemove()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset(undefined, { keepValues: true })
    }
  }

  return (
    <Popover modal open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-80 overflow-y-auto'
        onInteractOutside={() => setOpen(false)}
        sideOffset={8}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.priority.title')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={() => setOpen(false)} />
          </div>

          <Select
            value={priority ?? ''}
            onValueChange={(value) =>
              setValue('priority', value as TaskPriority, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
              })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('task.priority.placeholder')}>
                {priority ? (
                  <div className='flex items-center gap-2'>
                    {getTaskPriorityIcon()[priority]}
                    {t(TaskPriorityLabel[priority])}
                  </div>
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(TaskPriority).map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className='flex items-center gap-2'>
                      {getTaskPriorityIcon()[p as TaskPriority]}
                      {t(TaskPriorityLabel[p as TaskPriority])}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className='flex justify-end items-center gap-2'>
            {canDelete ? (
              <Button variant='ghost' onClick={handleRemove}>
                {t('common.button.remove')}
              </Button>
            ) : null}
            <Button onClick={handleSave} disabled={!isDirty}>
              {t('common.button.save')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
