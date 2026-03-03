import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { XIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddSubtask } from '../hooks/use-add-subtask'
import type { AddSubtaskFormValues } from '../validations'

interface SubtaskPopoverProps {
  children: React.ReactNode
  taskId: string
  projectId: string
  parentMilestoneId: string
}

export default function SubtaskPopover({ children, taskId, projectId, parentMilestoneId }: SubtaskPopoverProps) {
  const { t } = useTranslation()
  const { methods, addSubtask, isAddingSubtask, open, setOpen, recalculatePosition } = useAddSubtask({
    taskId,
    projectId,
    parentMilestoneId
  })

  useEffect(() => {
    if (open && taskId) {
      methods.reset({
        taskId,
        name: t('task.subtask.subtask'),
        index: 0,
        parentId: null
      })
    }
  }, [open, taskId, methods, t])

  const onSubmit: SubmitHandler<AddSubtaskFormValues> = (body) => {
    recalculatePosition()
    const updatedBody = {
      ...body,
      index: methods.getValues('index')
    }

    addSubtask({ body: updatedBody })
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        onInteractOutside={handleClose}
        sideOffset={8}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.subtask.subtaskTitle')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-2'>
            <Controller
              name='name'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name} className='gap-0.5'>
                    {t('task.subtask.title')}
                    <span className='text-destructive font-semibold'>*</span>
                  </FieldLabel>

                  <Input
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                    spellCheck={false}
                    autoFocus={true}
                    {...field}
                  />
                </Field>
              )}
            />
            <Button disabled={isAddingSubtask}>
              {isAddingSubtask ? <Spinner /> : null}
              {t('common.button.add')}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
