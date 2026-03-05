import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetRevenueLabels } from '@/features/projects/hooks/use-get-revenue-labels'
import { cn, getColorTextClass } from '@/shared/utils'
import type { RevenueLabel } from '@/types/label.type'
import { ChevronLeftIcon, PencilIcon, PlusIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../constants'
import { useAddProjectRevenueLabel } from '../hooks/use-add-project-revenue-label'
import { useDeleteProjectRevenueLabel } from '../hooks/use-delete-project-revenue-label'
import { useUpdateProjectRevenueLabel } from '../hooks/use-update-project-revenue-label'
import type { AddProjectLabelFormValues, UpdateProjectLabelFormValues } from '../validations'
import AddLabelForm from './add-label-form'
import UpdateLabelForm from './update-label-form'

interface PopoverHeaderProps {
  title: string
  onBack?: () => void
  onClose: () => void
}

function PopoverHeader({ title, onBack, onClose }: PopoverHeaderProps) {
  return (
    <div className='flex items-center justify-between px-3 py-2.5 border-b'>
      <div className='w-6'>
        {onBack && (
          <button
            type='button'
            onClick={onBack}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <ChevronLeftIcon className='size-4' />
          </button>
        )}
      </div>
      <p className='text-xs font-semibold text-foreground/70 uppercase tracking-wide'>{title}</p>
      <button type='button' onClick={onClose} className='text-muted-foreground hover:text-foreground transition-colors'>
        <XIcon className='size-4' />
      </button>
    </div>
  )
}

interface RevenueLabelPopoverProps {
  children: React.ReactNode
  projectId: string
  selectedIds?: string[]
  onSelect?: (id: string) => void
  onSelectAll?: (ids: string[]) => void
}

export default function RevenueLabelPopover({
  children,
  projectId,
  selectedIds = [],
  onSelect,
  onSelectAll
}: RevenueLabelPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view')
  const [editLabel, setEditLabel] = useState<RevenueLabel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()

  const { revenueLabels, isLoadingRevenueLabels } = useGetRevenueLabels({ projectId })

  const allItems = revenueLabels?.value?.items ?? []
  const filteredLabels = allItems.filter((label) => label.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredIds = filteredLabels.map((l) => l.id)
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id))
  const someSelected = filteredIds.some((id) => selectedIds.includes(id)) && !allSelected

  const handleToggleAll = () => {
    if (!onSelectAll) return
    if (allSelected) {
      onSelectAll(selectedIds.filter((id) => !filteredIds.includes(id)))
    } else {
      const merged = Array.from(new Set([...selectedIds, ...filteredIds]))
      onSelectAll(merged)
    }
  }

  const {
    methods: addLabelMethods,
    addProjectRevenueLabel,
    isAddingProjectRevenueLabel
  } = useAddProjectRevenueLabel({ projectId })
  const onSubmitAddLabel: SubmitHandler<AddProjectLabelFormValues> = (body) => {
    addProjectRevenueLabel({ body })
    setMode('view')
  }

  const {
    methods: updateLabelMethods,
    updateProjectRevenueLabel,
    isUpdatingProjectRevenueLabel
  } = useUpdateProjectRevenueLabel({ projectId })
  const onSubmitUpdateLabel: SubmitHandler<UpdateProjectLabelFormValues> = (body) => {
    updateProjectRevenueLabel({ body })
    setMode('view')
  }
  const onUpdateLabel = (label: RevenueLabel) => {
    setMode('edit')
    setEditLabel(label)
    updateLabelMethods.reset({ id: label.id, name: label.name, color: label.color })
  }

  const { deleteProjectRevenueLabel, isDeletingProjectRevenueLabel } = useDeleteProjectRevenueLabel({ projectId })
  const onDeleteRevenueLabel = (labelId: string) => {
    deleteProjectRevenueLabel({ labelId })
    setIsDeleting(false)
    setEditLabel(null)
    setMode('view')
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
      sortedTaskLabelColors.find((c) => c.shades.some((s) => s.isDefaultSelect))?.shades.find((s) => s.isDefaultSelect)
        ?.value,
    []
  )

  useEffect(() => {
    if (open) addLabelMethods.reset({ projectId, color: defaultColor, name: '' })
  }, [open, addLabelMethods, projectId, defaultColor])

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align='start'
        side='bottom'
        avoidCollisions={true}
        collisionPadding={12}
        className='p-0 w-72 shadow-lg border rounded-xl overflow-hidden max-h-64 overflow-y-auto'
        onInteractOutside={handleClose}
        sideOffset={6}
        onWheel={(e) => e.stopPropagation()}
      >
        {mode === 'view' && (
          <div className='flex flex-col'>
            <PopoverHeader title={t('project.projectRevenue.stats.labels')} onClose={handleClose} />

            <div className='p-3 space-y-2'>
              {/* Search */}
              <Input
                placeholder={t('project.projectRevenue.stats.findLabel')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-8 text-sm'
              />

              {onSelect && !isLoadingRevenueLabels && filteredLabels.length > 0 && (
                <div
                  className='flex items-center gap-2 px-1 py-1 rounded-md hover:bg-accent/50 cursor-pointer'
                  onClick={handleToggleAll}
                >
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={handleToggleAll}
                    className='size-3.5'
                  />
                  <span className='text-xs text-muted-foreground font-medium'>
                    {allSelected
                      ? t('common.deselectAll', { defaultValue: 'Deselect all' })
                      : t('common.selectAll', { defaultValue: 'Select all' })}
                  </span>
                </div>
              )}

              {isLoadingRevenueLabels ? (
                <div className='space-y-1.5'>
                  <Skeleton className='h-7 rounded-md' />
                  <Skeleton className='h-7 rounded-md' />
                  <Skeleton className='h-7 rounded-md' />
                </div>
              ) : filteredLabels.length > 0 ? (
                <div className='space-y-1'>
                  {filteredLabels.map((label) => {
                    const isSelected = selectedIds.includes(label.id)
                    return (
                      <div key={label.id} className='flex items-center gap-1.5 group'>
                        {/* Checkbox khi có onSelect */}
                        {onSelect && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelect(label.id)}
                            className='size-3.5 shrink-0'
                          />
                        )}

                        <button
                          type='button'
                          className={cn(
                            label.color || 'bg-gray-200',
                            'h-7 rounded-md flex items-center px-2.5 flex-1 min-w-0 text-left transition-all',
                            isSelected && onSelect ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                          )}
                          onClick={() => onSelect?.(label.id)}
                        >
                          <span
                            className={cn(
                              'text-xs font-semibold truncate flex-1',
                              getColorTextClass(label.color ?? '')
                            )}
                          >
                            {label.name}
                          </span>
                        </button>

                        <button
                          type='button'
                          onClick={() => onUpdateLabel(label)}
                          className='size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all shrink-0'
                        >
                          <PencilIcon className='size-3.5' />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className='text-xs text-muted-foreground text-center py-3'>
                  {searchQuery
                    ? t('comboboxField.emptyMessage')
                    : t('project.projectRevenue.stats.noLabels', { defaultValue: 'No labels yet' })}
                </p>
              )}

              <button
                type='button'
                onClick={() => setMode('add')}
                className='w-full h-8 flex items-center justify-center gap-1.5 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-accent/50 transition-all'
              >
                <PlusIcon className='size-3.5' />
                {t('project.projectRevenue.stats.createLabel')}
              </button>
            </div>
          </div>
        )}

        {mode === 'add' && (
          <div className='flex flex-col'>
            <PopoverHeader
              title={t('project.projectRevenue.stats.createLabel')}
              onBack={() => setMode('view')}
              onClose={handleClose}
            />
            <FormProvider {...addLabelMethods}>
              <form onSubmit={addLabelMethods.handleSubmit(onSubmitAddLabel)}>
                <AddLabelForm />
                <div className='px-4 pb-4'>
                  <Button type='submit' size='sm' className='w-full' disabled={isAddingProjectRevenueLabel}>
                    {isAddingProjectRevenueLabel ? <Spinner className='size-3.5' /> : null}
                    {t('project.projectRevenue.stats.create')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        )}

        {mode === 'edit' &&
          editLabel &&
          (isDeleting ? (
            <div className='flex flex-col'>
              <PopoverHeader
                title={t('project.projectRevenue.stats.deleteLabel')}
                onBack={() => setIsDeleting(false)}
                onClose={handleClose}
              />
              <div className='p-4 space-y-3'>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {t('project.projectRevenue.stats.deleteLabelConfirmation')}
                </p>
                <Button
                  className='w-full'
                  size='sm'
                  variant='destructive'
                  disabled={isDeletingProjectRevenueLabel}
                  onClick={() => onDeleteRevenueLabel(editLabel.id)}
                >
                  {isDeletingProjectRevenueLabel ? <Spinner className='size-3.5' /> : null}
                  {t('common.button.delete')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col'>
              <PopoverHeader
                title={t('project.projectRevenue.stats.editLabel')}
                onBack={() => {
                  setEditLabel(null)
                  setMode('view')
                }}
                onClose={handleClose}
              />
              <FormProvider {...updateLabelMethods}>
                <form onSubmit={updateLabelMethods.handleSubmit(onSubmitUpdateLabel)}>
                  <UpdateLabelForm />
                  <div className='px-4 pb-4 flex items-center gap-2'>
                    <Button type='submit' size='sm' className='flex-1' disabled={isUpdatingProjectRevenueLabel}>
                      {isUpdatingProjectRevenueLabel ? <Spinner className='size-3.5' /> : null}
                      {t('common.button.save')}
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      variant='destructive'
                      disabled={isDeletingProjectRevenueLabel}
                      onClick={() => setIsDeleting(true)}
                    >
                      {t('common.button.delete')}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          ))}
      </PopoverContent>
    </Popover>
  )
}
