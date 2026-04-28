import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn } from '@/shared/utils'
import type { SubtaskWithChildren } from '@/types/subtask.type'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useMemo, useState } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddSubtask } from '../hooks/use-add-subtask'
import { useDeleteSubtask } from '../hooks/use-delete-subtask'
import { useUpdateSubtask } from '../hooks/use-update-subtask'
import { useUpdateSubtaskStatus } from '../hooks/use-update-subtask-status'
import { updateSubtaskSchema, updateSubtaskStatusSchema, type AddSubtaskFormValues } from '../validations'
import SortableSubtaskCard from './sortable-subtask-card'

interface ParentSubtaskCardProps {
  subtask: SubtaskWithChildren
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  editingSubtaskId: string | null
  setEditingSubtaskId: (value: string | null) => void
}

export default function ParentSubtaskCard({
  subtask,
  taskId,
  editingSubtaskId,
  setEditingSubtaskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: ParentSubtaskCardProps) {
  const { t } = useTranslation()

  const isAdding = editingSubtaskId === subtask.id
  const completedCount = subtask.children.filter((child) => child.isCompleted).length
  const progress = subtask.children.length === 0 ? 0 : (completedCount / subtask.children.length) * 100

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('TASKS', 'canWrite')
  const canDelete = check('TASKS', 'canDelete')
  const canUpdate = check('TASKS', 'canUpdate')

  const [toggleViewCompleted, setToggleViewCompleted] = useState(true)
  const { methods, addSubtask, isAddingSubtask, recalculateChildrenPosition } = useAddSubtask({
    taskId,
    isAddingChildren: true,
    subtaskId: subtask.id,
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const { updateSubtask } = useUpdateSubtask({ taskId })
  const { updateSubtaskStatus } = useUpdateSubtaskStatus({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const { deleteSubtask, isDeletingSubtask } = useDeleteSubtask({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const { isEditing, inputProps, triggerProps } = useInlineEdit({
    initialValue: subtask.name,
    clickType: 'single',
    onSave: (newName) => {
      const validated = updateSubtaskSchema(t).safeParse({
        id: subtask.id,
        name: newName,
        index: subtask.index,
        parentId: subtask.parentId
      })

      if (validated.success) {
        updateSubtask({ body: validated.data })
      }
    }
  })

  const displayedChildren = toggleViewCompleted
    ? subtask.children
    : subtask.children.filter((child) => !child.isCompleted)

  const childrenIds = useMemo(() => displayedChildren.map((child) => child.id), [displayedChildren])

  const onSubmit: SubmitHandler<AddSubtaskFormValues> = (body) => {
    recalculateChildrenPosition()
    const updatedBody = {
      ...body,
      index: methods.getValues('index')
    }

    addSubtask({ body: updatedBody })
    setEditingSubtaskId(null)
  }

  const handleCheckboxChange = (checked: boolean) => {
    const validated = updateSubtaskStatusSchema(t).safeParse({
      id: subtask.id,
      isCompleted: checked
    })

    if (validated.success) {
      updateSubtaskStatus({ body: validated.data })
    }
  }

  useEffect(() => {
    if (isAdding && taskId) {
      methods.reset({
        taskId,
        name: '',
        index: 0,
        parentId: subtask.id
      })
    }
  }, [isAdding, taskId, methods, t, subtask])

  return (
    <div className='space-y-2'>
      {isEditing ? (
        <div className='flex items-center gap-2'>
          <Checkbox checked={subtask.isCompleted} disabled />
          <Input type='text' className='h-8 text-base! font-semibold px-2' {...inputProps} />
        </div>
      ) : (
        <div className='flex gap-3'>
          <Checkbox
            checked={subtask.isCompleted}
            onCheckedChange={handleCheckboxChange}
            className='mt-2 size-4'
            disabled={!canUpdate}
          />
          <div className='flex justify-start items-center gap-2 w-full'>
            <p
              className={cn(
                'font-semibold hover:bg-muted rounded-sm py-1',
                canUpdate ? 'cursor-text' : 'cursor-default'
              )}
              {...(canUpdate ? triggerProps : {})}
            >
              {subtask.name}
            </p>
            <div className='flex-1' />
            {progress > 0 && (
              <Button variant='secondary' size='sm' onClick={() => setToggleViewCompleted(!toggleViewCompleted)}>
                {toggleViewCompleted
                  ? t('task.subtask.hideCompletedItems')
                  : `${t('task.subtask.showCompletedItems')} (${completedCount})`}
              </Button>
            )}

            {canDelete ? (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => deleteSubtask({ id: subtask.id })}
                disabled={isDeletingSubtask}
              >
                {t('common.button.delete')}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <div className='flex gap-3'>
        <p className='text-[10px] text-muted-foreground'>{progress.toFixed(0)}%</p>

        <div className='w-full space-y-2 mt-1'>
          <Progress value={progress} />

          {displayedChildren.length === 0 && subtask.isCompleted ? (
            <p className='text-sm text-muted-foreground'>{t('task.subtask.allCompletedItems')}</p>
          ) : (
            <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
              <div className='space-y-1'>
                {displayedChildren.map((children) => (
                  <SortableSubtaskCard
                    key={children.id}
                    subtask={children}
                    taskId={taskId}
                    projectIdentifier={projectIdentifier}
                    parentMilestoneIdentifier={parentMilestoneIdentifier}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          <div className='space-y-2'>
            {isAdding ? (
              <Controller
                name='name'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <Input
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete='off'
                      spellCheck={false}
                      placeholder={t('task.subtask.addItemPlaceholder')}
                      autoFocus={true}
                      className='h-8'
                      {...field}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') {
                          methods.handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </Field>
                )}
              />
            ) : null}

            {isAdding ? (
              <div className='space-x-2'>
                <Button size='sm' onClick={() => methods.handleSubmit(onSubmit)()} disabled={isAddingSubtask}>
                  {isAddingSubtask ? <Spinner /> : null}
                  {t('common.button.add')}
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => setEditingSubtaskId(null)}
                  disabled={isAddingSubtask}
                >
                  {t('common.button.cancel')}
                </Button>
              </div>
            ) : canWrite ? (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setEditingSubtaskId(subtask.id)}
                disabled={isAddingSubtask}
              >
                {t('task.subtask.addItem')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
