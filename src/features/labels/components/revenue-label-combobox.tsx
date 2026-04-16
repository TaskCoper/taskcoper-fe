import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import { cn, getColorTextClass } from '@/shared/utils'
import type { RevenueLabel } from '@/types/label.type'
import { ChevronDownIcon, ChevronLeftIcon, PencilIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../constants'
import { useAddProjectRevenueLabel } from '../hooks/use-add-project-revenue-label'
import { useDeleteProjectRevenueLabel } from '../hooks/use-delete-project-revenue-label'
import { useGetProjectRevenueLabels } from '../hooks/use-get-project-revenue-labels'
import { useUpdateProjectRevenueLabel } from '../hooks/use-update-project-revenue-label'
import type { AddProjectRevenueLabelFormValues, UpdateProjectRevenueLabelFormValues } from '../validations'
import AddLabelForm from './add-label-form'
import UpdateLabelForm from './update-label-form'

interface RevenueLabelComboboxProps {
  projectIdentifier: string
  selectedLabelIds: string[]
  onSelectionChange: (labelIds: string[]) => void
}

export default function RevenueLabelCombobox({
  projectIdentifier,
  selectedLabelIds,
  onSelectionChange
}: RevenueLabelComboboxProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view')
  const { t } = useTranslation()
  const [editLabel, setEditLabel] = useState<RevenueLabel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('REVENUE', 'canWrite')
  const canDelete = check('REVENUE', 'canDelete')
  const canUpdate = check('REVENUE', 'canUpdate')

  const { revenueLabels, isLoadingRevenueLabels } = useGetProjectRevenueLabels({ projectIdentifier })
  const allLabels = useMemo(() => revenueLabels.value.items, [revenueLabels])
  const filteredLabels = allLabels.filter((label) => label.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const selectedLabels = useMemo(
    () => allLabels.filter((label) => selectedLabelIds.includes(label.id)),
    [allLabels, selectedLabelIds]
  )

  const {
    methods: addLabelMethods,
    addProjectRevenueLabel,
    isAddingProjectRevenueLabel
  } = useAddProjectRevenueLabel({ projectIdentifier })

  const onSubmitAddLabel: SubmitHandler<AddProjectRevenueLabelFormValues> = (body) => {
    addProjectRevenueLabel({ body })
    setMode('view')
  }

  const {
    methods: updateLabelMethods,
    updateProjectRevenueLabel,
    isUpdatingProjectRevenueLabel
  } = useUpdateProjectRevenueLabel({ projectIdentifier })

  const onSubmitUpdateLabel: SubmitHandler<UpdateProjectRevenueLabelFormValues> = (body) => {
    updateProjectRevenueLabel({ body })
    setMode('view')
  }

  const onUpdateLabel = (label: RevenueLabel) => {
    setMode('edit')
    setEditLabel(label)
    updateLabelMethods.reset({
      id: label.id,
      name: label.name,
      color: label.color,
      projectIdentifier
    })
  }

  const { deleteProjectRevenueLabel, isDeletingProjectRevenueLabel } = useDeleteProjectRevenueLabel({
    projectIdentifier
  })
  const onDeleteProjectLabel = (labelId: string) => {
    deleteProjectRevenueLabel({ projectIdentifier, labelId })
    onSelectionChange(selectedLabelIds.filter((id) => id !== labelId))
    setIsDeleting(false)
    setEditLabel(null)
    setMode('view')
  }

  const handleToggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      if (canDelete) {
        onSelectionChange(selectedLabelIds.filter((id) => id !== labelId))
      }
    } else {
      onSelectionChange([...selectedLabelIds, labelId])
    }
  }

  const handleRemoveLabel = (labelId: string) => {
    if (canDelete) {
      onSelectionChange(selectedLabelIds.filter((id) => id !== labelId))
    }
  }

  const handleClose = () => {
    setMode('view')
    setOpen(false)
    setIsDeleting(false)
    setEditLabel(null)
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
      addLabelMethods.reset({
        projectIdentifier,
        color: defaultColor,
        name: ''
      })
    }
  }, [open, addLabelMethods, projectIdentifier, defaultColor])

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' type='button'>
          <div className='flex flex-wrap items-center gap-1 flex-1 min-w-0'>
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <span
                  key={label.id}
                  className={cn(
                    label.color || 'bg-gray-200',
                    'inline-flex items-center gap-1 rounded-sm px-1.5 h-5 text-xs font-semibold'
                  )}
                >
                  <span className={cn('truncate w-auto max-w-10', getColorTextClass(label.color ?? ''))}>
                    {label.name}
                  </span>
                  {canDelete ? (
                    <XIcon
                      className={cn('size-3 shrink-0 cursor-pointer', getColorTextClass(label.color ?? ''))}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveLabel(label.id)
                      }}
                    />
                  ) : null}
                </span>
              ))
            ) : (
              <span className='text-muted-foreground'>{t('common.field.label')}</span>
            )}
          </div>
          <ChevronDownIcon className='size-4 shrink-0 text-muted-foreground' />
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
              <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('common.field.label')}</p>
              <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
            </div>

            <Input
              placeholder={t('task.label.findLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className='space-y-4'>
              {isLoadingRevenueLabels ? (
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
                          checked={selectedLabelIds.includes(label.id)}
                          onCheckedChange={() => handleToggleLabel(label.id)}
                          disabled={selectedLabelIds.includes(label.id) && !canDelete}
                          className={cn(
                            'mr-2',
                            selectedLabelIds.includes(label.id) && !canDelete && 'cursor-not-allowed'
                          )}
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
                        {canUpdate ? (
                          <Button className='ml-1' variant='ghost' size='icon-sm' onClick={() => onUpdateLabel(label)}>
                            <PencilIcon />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {canWrite ? (
                <Button variant='secondary' className='w-full' onClick={() => setMode('add')}>
                  {t('task.label.createLabel')}
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
                <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.label.createLabel')}</p>
                <Button variant='ghost' size='icon-sm' onClick={handleClose} className='absolute right-0'>
                  <XIcon className='size-4' />
                </Button>
              </div>
            </div>

            <FormProvider {...addLabelMethods}>
              <form
                className='space-y-4'
                onSubmit={(e) => {
                  e.stopPropagation()
                  addLabelMethods.handleSubmit(onSubmitAddLabel)(e)
                }}
              >
                <AddLabelForm />

                <div className='px-4'>
                  <Button type='submit' size='sm' disabled={isAddingProjectRevenueLabel}>
                    {isAddingProjectRevenueLabel ? <Spinner /> : null}
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
                <Button
                  type='button'
                  className='w-full'
                  variant='destructive'
                  onClick={() => onDeleteProjectLabel(editLabel.id)}
                >
                  {isDeletingProjectRevenueLabel ? <Spinner /> : null}
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
                <form
                  className='space-y-4'
                  onSubmit={(e) => {
                    e.stopPropagation()
                    updateLabelMethods.handleSubmit(onSubmitUpdateLabel)(e)
                  }}
                >
                  <UpdateLabelForm />

                  <div className='px-4 flex items-center justify-between'>
                    <Button type='submit' size='sm' disabled={isUpdatingProjectRevenueLabel}>
                      {isUpdatingProjectRevenueLabel ? <Spinner /> : null}
                      {t('common.button.save')}
                    </Button>

                    {canDelete ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        disabled={isDeletingProjectRevenueLabel}
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
