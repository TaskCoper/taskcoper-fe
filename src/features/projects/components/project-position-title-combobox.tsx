import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import { cn, getColorTextClass } from '@/shared/utils'
import type { ProjectPositionTitle } from '@/types/project.type'
import { ChevronLeftIcon, ChevronsUpDownIcon, PencilIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../../labels/constants'
import { useAddProjectPositionTitle } from '../hooks/use-add-project-position-title'
import { useAssignProjectPositionTitle } from '../hooks/use-assign-project-position-title'
import { useDeleteProjectPositionTitle } from '../hooks/use-delete-project-position-title'
import { useGetProjectPositionTitles } from '../hooks/use-get-project-position-titles'
import { useUnassignProjectPositionTitle } from '../hooks/use-unassign-project-position-title'
import { useUpdateProjectPositionTitle } from '../hooks/use-update-project-position-title'
import type { AddProjectPositionTitleFormValues, UpdateProjectPositionTitleFormValues } from '../validations'

interface ProjectPositionTitleComboboxProps {
  projectIdentifier?: string
  userId: string
  selectedPositionTitles: Array<Pick<ProjectPositionTitle, 'id' | 'name' | 'color'>>
}

export default function ProjectPositionTitleCombobox({
  projectIdentifier,
  userId,
  selectedPositionTitles
}: ProjectPositionTitleComboboxProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view')
  const [editTitle, setEditTitle] = useState<ProjectPositionTitle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('SETTINGS', 'canWrite')
  const canDelete = check('SETTINGS', 'canDelete')
  const canUpdate = check('SETTINGS', 'canUpdate')

  const { positionTitles, isLoadingPositionTitles } = useGetProjectPositionTitles({
    projectIdentifier,
    enabled: open
  })

  const allTitles = useMemo(() => positionTitles.value.items, [positionTitles])
  const filteredTitles = allTitles.filter((title) => title.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const selectedTitleIds = useMemo(() => selectedPositionTitles.map((title) => title.id), [selectedPositionTitles])

  const {
    methods: addPositionTitleMethods,
    addProjectPositionTitle,
    isAddingProjectPositionTitle
  } = useAddProjectPositionTitle({ projectIdentifier: projectIdentifier ?? '' })

  const onSubmitAddTitle: SubmitHandler<AddProjectPositionTitleFormValues> = (body) => {
    addProjectPositionTitle({ body })
    setMode('view')
  }

  const {
    methods: updatePositionTitleMethods,
    updateProjectPositionTitle,
    isUpdatingProjectPositionTitle
  } = useUpdateProjectPositionTitle({ projectIdentifier: projectIdentifier ?? '' })

  const onSubmitUpdateTitle: SubmitHandler<UpdateProjectPositionTitleFormValues> = (body) => {
    updateProjectPositionTitle({ body })
    setMode('view')
  }

  const { deleteProjectPositionTitle, isDeletingProjectPositionTitle } = useDeleteProjectPositionTitle({
    projectIdentifier: projectIdentifier ?? ''
  })

  const { assignProjectPositionTitle, isAssigningProjectPositionTitle } = useAssignProjectPositionTitle({
    projectIdentifier: projectIdentifier ?? ''
  })

  const { unassignProjectPositionTitle, isUnassigningProjectPositionTitle } = useUnassignProjectPositionTitle({
    projectIdentifier: projectIdentifier ?? ''
  })

  const isAssigning = isAssigningProjectPositionTitle || isUnassigningProjectPositionTitle

  const onUpdateTitle = (title: ProjectPositionTitle) => {
    setMode('edit')
    setEditTitle(title)
    updatePositionTitleMethods.reset({
      titleId: title.id,
      name: title.name,
      description: title.description ?? '',
      color: title.color,
      projectIdentifier: projectIdentifier ?? ''
    })
  }

  const onDeleteTitle = (titleId: string) => {
    if (!projectIdentifier) return

    deleteProjectPositionTitle({ projectIdentifier, titleId })
    setIsDeleting(false)
    setEditTitle(null)
    setMode('view')
  }

  const handleToggleTitle = (titleId: string) => {
    if (!projectIdentifier) return

    if (selectedTitleIds.includes(titleId)) {
      if (canDelete) {
        unassignProjectPositionTitle({ projectIdentifier, titleId, userId })
      }

      return
    }

    if (canWrite) {
      assignProjectPositionTitle({ projectIdentifier, titleId, userId })
    }
  }

  const handleClose = () => {
    setMode('view')
    setOpen(false)
    setIsDeleting(false)
    setEditTitle(null)
    setSearchQuery('')
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
      addPositionTitleMethods.reset({
        projectIdentifier: projectIdentifier ?? '',
        color: defaultColor,
        name: '',
        description: ''
      })
    }
  }, [open, addPositionTitleMethods, projectIdentifier, defaultColor])

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' type='button' className='h-8 px-1! w-fit max-w-full overflow-hidden gap-1'>
          <div className='flex flex-nowrap items-center gap-1 flex-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap'>
            {selectedPositionTitles.length > 0 ? (
              selectedPositionTitles.length > 100 ? (
                <p className='truncate font-normal px-1'>
                  {selectedPositionTitles.length} {t('common.ui.selected')}
                </p>
              ) : (
                selectedPositionTitles.map((title) => (
                  <span
                    key={title.id}
                    className={cn(
                      title.color || 'bg-gray-200',
                      'inline-flex items-center gap-1 rounded-sm px-1.5 h-5 text-xs font-semibold max-w-full shrink-0'
                    )}
                  >
                    <span className={cn('truncate', getColorTextClass(title.color ?? ''))}>{title.name}</span>
                  </span>
                ))
              )
            ) : (
              <span className='text-muted-foreground px-1 font-normal'>
                {t('project.updateProjectMembers.column.noPositionTitles')}
              </span>
            )}
          </div>
          <ChevronsUpDownIcon className='shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-80 overflow-y-auto'
        onInteractOutside={handleClose}
        sideOffset={8}
      >
        {mode === 'view' ? (
          <div className='p-4 space-y-4'>
            <div className='flex items-center justify-center relative'>
              <p className='text-sm font-bold w-full text-center text-foreground/80'>
                {t('project.updateProjectMembers.positionTitle.title')}
              </p>
              <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
            </div>

            <Input
              placeholder={t('project.updateProjectMembers.positionTitle.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className='space-y-4'>
              {isLoadingPositionTitles ? (
                <div className='space-y-2'>
                  <Skeleton className='h-8' />
                  <Skeleton className='h-8' />
                  <Skeleton className='h-8' />
                </div>
              ) : filteredTitles.length > 0 ? (
                <div className='space-y-2'>
                  <p className='text-sm font-bold w-full text-foreground/60'>
                    {t('project.updateProjectMembers.positionTitle.title')}
                  </p>

                  <div className='space-y-1'>
                    {filteredTitles.map((title) => (
                      <div key={title.id} className='flex items-center'>
                        <Checkbox
                          checked={selectedTitleIds.includes(title.id)}
                          onCheckedChange={() => handleToggleTitle(title.id)}
                          disabled={
                            isAssigning ||
                            !projectIdentifier ||
                            (selectedTitleIds.includes(title.id) && !canDelete) ||
                            (!selectedTitleIds.includes(title.id) && !canWrite)
                          }
                          className={cn(
                            'mr-2',
                            selectedTitleIds.includes(title.id) && !canDelete && 'cursor-not-allowed',
                            !selectedTitleIds.includes(title.id) && !canWrite && 'cursor-not-allowed'
                          )}
                        />
                        <div
                          className={cn(
                            title.color || 'bg-gray-200',
                            'h-8 rounded-sm flex items-center px-2 flex-1 min-w-0'
                          )}
                        >
                          {title.name ? (
                            <p className={cn('text-sm font-semibold truncate', getColorTextClass(title.color ?? ''))}>
                              {title.name}
                            </p>
                          ) : null}
                        </div>
                        {canUpdate ? (
                          <Button className='ml-1' variant='ghost' size='icon-sm' onClick={() => onUpdateTitle(title)}>
                            <PencilIcon />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground text-center'>{t('common.ui.noResults')}</p>
              )}

              {canWrite ? (
                <Button variant='secondary' className='w-full' onClick={() => setMode('add')}>
                  {t('project.updateProjectMembers.positionTitle.createTitle')}
                </Button>
              ) : null}
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
                <p className='text-sm font-bold w-full text-center text-foreground/80'>
                  {t('project.updateProjectMembers.positionTitle.createTitle')}
                </p>
                <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                  <XIcon className='size-4' />
                </Button>
              </div>
            </div>

            <FormProvider {...addPositionTitleMethods}>
              <form
                className='space-y-4 px-4'
                onSubmit={(e) => {
                  e.stopPropagation()
                  addPositionTitleMethods.handleSubmit(onSubmitAddTitle)(e)
                }}
              >
                <Controller
                  name='name'
                  control={addPositionTitleMethods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1'>
                      <FieldLabel htmlFor={field.name} className='gap-0.5'>
                        {t('common.field.title')}
                        <span className='text-destructive font-semibold'>*</span>
                      </FieldLabel>
                      <Input {...field} id={field.name} autoComplete='off' spellCheck={false} autoFocus />
                    </Field>
                  )}
                />

                <Controller
                  name='description'
                  control={addPositionTitleMethods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1'>
                      <FieldLabel htmlFor={field.name}>{t('common.field.description')}</FieldLabel>
                      <Textarea {...field} id={field.name} rows={3} />
                    </Field>
                  )}
                />

                <Controller
                  name='color'
                  control={addPositionTitleMethods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1'>
                      <FieldLabel htmlFor={field.name}>{t('task.label.chooseColor')}</FieldLabel>

                      <div className='grid grid-cols-5 gap-2'>
                        {sortedTaskLabelColors.map((col) => (
                          <div key={col.baseColor} className='flex flex-col gap-2'>
                            {col.shades.map((shade) => (
                              <div
                                key={shade.value}
                                role='button'
                                className={cn(
                                  shade.value,
                                  shade.value === field.value ? 'ring-2 ring-primary ring-offset-2' : '',
                                  'w-full h-8 rounded cursor-pointer'
                                )}
                                onClick={() => field.onChange(shade.value)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </Field>
                  )}
                />

                <Button type='submit' size='sm' disabled={isAddingProjectPositionTitle}>
                  {isAddingProjectPositionTitle ? <Spinner /> : null}
                  {t('common.button.create')}
                </Button>
              </form>
            </FormProvider>
          </div>
        ) : null}

        {mode === 'edit' && editTitle ? (
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
                    {t('project.updateProjectMembers.positionTitle.deleteTitle')}
                  </p>
                  <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              </div>

              <div className='px-4 space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  {t('project.updateProjectMembers.positionTitle.deleteConfirmation')}
                </p>
                <Button
                  type='button'
                  className='w-full'
                  variant='destructive'
                  onClick={() => onDeleteTitle(editTitle.id)}
                >
                  {isDeletingProjectPositionTitle ? <Spinner /> : null}
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
                      setEditTitle(null)
                      setMode('view')
                    }}
                    className='absolute left-0'
                  >
                    <ChevronLeftIcon className='size-4' />
                  </Button>
                  <p className='text-sm font-bold w-full text-center text-foreground/80'>
                    {t('project.updateProjectMembers.positionTitle.editTitle')}
                  </p>
                  <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              </div>

              <FormProvider {...updatePositionTitleMethods}>
                <form
                  className='space-y-4 px-4'
                  onSubmit={(e) => {
                    e.stopPropagation()
                    updatePositionTitleMethods.handleSubmit(onSubmitUpdateTitle)(e)
                  }}
                >
                  <Controller
                    name='name'
                    control={updatePositionTitleMethods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name} className='gap-0.5'>
                          {t('common.field.title')}
                          <span className='text-destructive font-semibold'>*</span>
                        </FieldLabel>
                        <Input {...field} id={field.name} autoComplete='off' spellCheck={false} autoFocus />
                      </Field>
                    )}
                  />

                  <Controller
                    name='description'
                    control={updatePositionTitleMethods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name}>{t('common.field.description')}</FieldLabel>
                        <Textarea {...field} id={field.name} rows={3} />
                      </Field>
                    )}
                  />

                  <Controller
                    name='color'
                    control={updatePositionTitleMethods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name}>{t('task.label.chooseColor')}</FieldLabel>

                        <div className='grid grid-cols-5 gap-2'>
                          {sortedTaskLabelColors.map((col) => (
                            <div key={col.baseColor} className='flex flex-col gap-2'>
                              {col.shades.map((shade) => (
                                <div
                                  key={shade.value}
                                  role='button'
                                  className={cn(
                                    shade.value,
                                    shade.value === field.value ? 'ring-2 ring-primary ring-offset-2' : '',
                                    'w-full h-8 rounded cursor-pointer'
                                  )}
                                  onClick={() => field.onChange(shade.value)}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </Field>
                    )}
                  />

                  <div className='flex items-center justify-between'>
                    <Button type='submit' size='sm' disabled={isUpdatingProjectPositionTitle}>
                      {isUpdatingProjectPositionTitle ? <Spinner /> : null}
                      {t('common.button.save')}
                    </Button>

                    {canDelete ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        disabled={isDeletingProjectPositionTitle}
                        onClick={() => setIsDeleting(true)}
                      >
                        {t('common.button.delete')}
                      </Button>
                    ) : null}
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
