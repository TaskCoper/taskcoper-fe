import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { addTaskLabelSchema } from '@/features/tasks/validations'
import { cn, getColorTextClass } from '@/shared/utils'
import type { Label, TaskLabel } from '@/types/label.type'
import { ChevronLeftIcon, PencilIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../constants'
import { useAddProjectLabel } from '../hooks/use-add-project-label'
import { useAddTaskLabel } from '../hooks/use-add-task-label'
import { useDeleteProjectLabel } from '../hooks/use-delete-project-label'
import { useDeleteTaskLabel } from '../hooks/use-delete-task-label'
import { useGetProjectLabels } from '../hooks/use-get-project-labels'
import { useUpdateProjectLabel } from '../hooks/use-update-project-label'
import { type AddProjectLabelFormValues, type UpdateProjectLabelFormValues } from '../validations'
import AddLabelForm from './add-label-form'
import UpdateLabelForm from './update-label-form'

interface LabelPopoverProps {
  children: React.ReactNode
  projectIdentifier: string
  taskSlug: string
  taskId: string
  parentMilestoneIdentifier: string
  taskLabels: TaskLabel[]
}

export default function LabelPopover({
  children,
  projectIdentifier,
  taskSlug,
  taskId,
  parentMilestoneIdentifier,
  taskLabels
}: LabelPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view')
  const { t } = useTranslation()
  const [editLabel, setEditLabel] = useState<Label | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { labels, isLoadingLabels } = useGetProjectLabels({ projectIdentifier, enabled: open })
  const filteredLabels =
    labels?.value.items.filter((label) => label.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const { methods: addLabelMethods, addProjectLabel, isAddingProjectLabel } = useAddProjectLabel({ projectIdentifier })
  const onSubmitAddLabel: SubmitHandler<AddProjectLabelFormValues> = (body) => {
    addProjectLabel({ body })
    setMode('view')
  }

  const {
    methods: updateLabelMethods,
    updateProjectLabel,
    isUpdatingProjectLabel
  } = useUpdateProjectLabel({
    projectIdentifier,
    taskIdentifier: taskSlug,
    parentMilestoneIdentifier
  })
  const onSubmitUpdateLabel: SubmitHandler<UpdateProjectLabelFormValues> = (body) => {
    updateProjectLabel({ body })
    setMode('view')
  }

  const onUpdateLabel = (label: Label) => {
    setMode('edit')
    setEditLabel(label)
    updateLabelMethods.reset({
      id: label.id,
      name: label.name,
      color: label.color
    })
  }

  const {
    methods: addTaskLabelMethods,
    addTaskLabel,
    isAddingTaskLabel
  } = useAddTaskLabel({ taskIdentifier: taskSlug, projectIdentifier, parentMilestoneIdentifier, enabled: open })
  const onAddTaskLabel = () => {
    const result = addTaskLabelSchema.safeParse(addTaskLabelMethods.getValues())

    if (result.success) {
      addTaskLabel({ body: result.data })
    }
  }

  const { deleteTaskLabel, isDeletingTaskLabel } = useDeleteTaskLabel({
    taskIdentifier: taskSlug,
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const onDeleteTaskLabel = (id: string) => {
    deleteTaskLabel({ id })
  }

  const { deleteProjectLabel, isDeletingProjectLabel } = useDeleteProjectLabel({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const onDeleteProjectLabel = (labelId: string) => {
    deleteProjectLabel({ labelId })
    setIsDeleting(false)
    setEditLabel(null)
    setMode('view')
  }

  const handleClose = () => {
    setMode('view')
    setOpen(false)
    setIsDeleting(false)
    setEditLabel(null)
  }

  const defaultColor = useMemo(
    () =>
      sortedTaskLabelColors
        .find((color) => color.shades.some((shade) => shade.isDefaultSelect))
        ?.shades.find((shade) => shade.isDefaultSelect)?.value,
    []
  )

  useEffect(() => {
    if (open) {
      addLabelMethods.reset({
        projectIdentifier,
        color: defaultColor,
        name: ''
      })
    }
  }, [open, addLabelMethods, projectIdentifier, defaultColor])

  useEffect(() => {
    if (open) {
      addTaskLabelMethods.reset({
        taskId
      })
    }
  }, [open, addTaskLabelMethods, taskId])

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-80 overflow-y-auto'
        onInteractOutside={handleClose}
        sideOffset={8}
      >
        {mode === 'view' ? (
          <div className='p-4 space-y-4'>
            <div className='flex items-center justify-center relative'>
              <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('common.field.label')}</p>
              <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
            </div>

            <Input
              placeholder={t('task.label.findLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className='space-y-4'>
              {isLoadingLabels ? (
                <div className='space-y-2'>
                  <Skeleton className='h-8' />
                  <Skeleton className='h-8' />
                  <Skeleton className='h-8' />
                </div>
              ) : filteredLabels.length > 0 ? (
                <div className='space-y-2'>
                  <p className='text-sm font-bold w-full text-foreground/60'>{t('common.field.label')}</p>

                  <div className='space-y-1'>
                    {filteredLabels.map((label) => (
                      <div key={label.id} className='flex items-center'>
                        <Checkbox
                          checked={taskLabels.some((taskLabel) => taskLabel.projectTaskLabelId === label.id)}
                          disabled={isAddingTaskLabel || isDeletingTaskLabel}
                          onCheckedChange={(value) => {
                            if (value) {
                              addTaskLabelMethods.setValue('projectTaskLabelId', label.id)
                              onAddTaskLabel()
                            } else {
                              const id = taskLabels.find((taskLabel) => taskLabel.projectTaskLabelId === label.id)?.id
                              if (id) {
                                onDeleteTaskLabel(id)
                              }
                            }
                          }}
                          className='mr-2'
                        />
                        <div
                          className={cn(
                            label.color || 'bg-gray-200',
                            'h-8 rounded-sm flex items-center px-2 flex-1 min-w-0'
                          )}
                        >
                          {label.name ? (
                            <p className={cn('text-sm font-semibold truncate', getColorTextClass(label.color ?? ''))}>
                              {label.name}
                            </p>
                          ) : null}
                        </div>
                        <Button className='ml-1' variant='ghost' size='icon-sm' onClick={() => onUpdateLabel(label)}>
                          <PencilIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button variant='secondary' className='w-full' onClick={() => setMode('add')}>
                {t('task.label.createLabel')}
              </Button>
            </div>
          </div>
        ) : null}

        {mode === 'add' ? (
          <div className='py-4 space-y-4'>
            <div className='px-2'>
              <div className='flex items-center justify-center relative'>
                <Button variant='ghost' size='icon-sm' onClick={() => setMode('view')} className='absolute left-0'>
                  <ChevronLeftIcon className='size-4' />
                </Button>
                <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.label.createLabel')}</p>
                <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                  <XIcon className='size-4' />
                </Button>
              </div>
            </div>

            <FormProvider {...addLabelMethods}>
              <form className='space-y-4' onSubmit={addLabelMethods.handleSubmit(onSubmitAddLabel)}>
                <AddLabelForm />

                <div className='px-4'>
                  <Button type='submit' size='sm' disabled={isAddingProjectLabel}>
                    {isAddingProjectLabel ? <Spinner /> : null}
                    {t('task.label.create')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        ) : null}

        {mode === 'edit' && editLabel ? (
          isDeleting ? (
            <div className='py-4 space-y-4'>
              <div className='px-2'>
                <div className='flex items-center justify-center relative'>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => {
                      setMode('edit')
                      setIsDeleting(false)
                    }}
                    className='absolute left-0'
                  >
                    <ChevronLeftIcon className='size-4' />
                  </Button>
                  <p className='text-sm font-bold w-full text-center text-foreground/80'>
                    {t('task.label.deleteLabel')}
                  </p>
                  <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              </div>

              <div className='px-4 space-y-2'>
                <p className='text-sm text-muted-foreground'>{t('task.label.deleteLabelConfirmation')}</p>
                <Button className='w-full' variant='destructive' onClick={() => onDeleteProjectLabel(editLabel.id)}>
                  {isDeletingProjectLabel ? <Spinner /> : null}
                  {t('common.button.delete')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='py-4 space-y-4'>
              <div className='px-2'>
                <div className='flex items-center justify-center relative'>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => {
                      setEditLabel(null)
                      setMode('view')
                    }}
                    className='absolute left-0'
                  >
                    <ChevronLeftIcon className='size-4' />
                  </Button>
                  <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.label.editLabel')}</p>
                  <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              </div>

              <FormProvider {...updateLabelMethods}>
                <form className='space-y-4' onSubmit={updateLabelMethods.handleSubmit(onSubmitUpdateLabel)}>
                  <UpdateLabelForm />

                  <div className='px-4 flex items-center justify-between'>
                    <Button type='submit' size='sm' disabled={isUpdatingProjectLabel}>
                      {isUpdatingProjectLabel ? <Spinner /> : null}
                      {t('common.button.save')}
                    </Button>

                    <Button
                      type='button'
                      size='sm'
                      variant='destructive'
                      disabled={isDeletingProjectLabel}
                      onClick={() => setIsDeleting(true)}
                    >
                      {t('common.button.delete')}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          )
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
