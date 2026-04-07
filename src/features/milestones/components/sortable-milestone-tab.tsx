import { Input } from '@/components/ui/input'
import { TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUpdateMilestone } from '@/features/milestones/hooks/use-update-milestone'
import { updateMilestoneSchema } from '@/features/milestones/validations'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn } from '@/shared/utils'
import type { MilestoneTabDragData, ParentMilestone } from '@/types/milestone.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDeleteMilestone } from '../hooks/use-delete-milestone'

interface SortableMilestoneTabProps {
  milestone: ParentMilestone
  isActive: boolean
  queryKey: unknown[]
  onDeleteSuccess?: () => void
  canDelete: boolean
}

export const SortableMilestoneTab = ({
  milestone,
  isActive,
  queryKey,
  onDeleteSuccess,
  canDelete
}: SortableMilestoneTabProps) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()

  const { updateMilestone } = useUpdateMilestone({ queryKey })
  const { deleteMilestone, isDeletingMilestone } = useDeleteMilestone({
    queryKey,
    onSuccessCallback: onDeleteSuccess
  })

  const { isEditing, inputProps, triggerProps } = useInlineEdit({
    initialValue: milestone.name,
    clickType: 'double',
    onSave: (newName) => {
      const validated = updateMilestoneSchema(t).safeParse({
        milestoneId: milestone.id,
        parentId: null,
        milestoneName: newName,
        position: milestone.position
      })

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
    }
  })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: milestone.id,
    data: {
      type: 'MilestoneTab',
      milestone
    } as MilestoneTabDragData,
    attributes: {
      roleDescription: 'MilestoneTab'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('milestone.deleteMilestone.title'),
      description: t('milestone.deleteMilestone.description', { milestoneName: milestone.name }),
      confirmText: t('milestone.deleteMilestone.confirmText'),
      cancelText: t('milestone.deleteMilestone.cancelText'),
      variant: 'destructive'
    })

    if (ok) {
      deleteMilestone({ milestoneId: milestone.id })
    }
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className='inline-flex h-9 items-center justify-center rounded-md px-2 py-1'>
        <Input type='text' className='h-8' {...inputProps} />
      </div>
    )
  }

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      asChild
      {...attributes}
      {...listeners}
      value={milestone.slug}
      className='inline-flex items-center data-[state=active]:bg-transparent justify-center whitespace-nowrap p-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative h-9 rounded-none border-b-2 border-b-transparent font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'
    >
      <div
        className={cn(
          'flex items-center gap-3 w-full',
          isActive ? 'w-auto' : 'w-40',
          canDelete ? 'justify-between' : 'justify-center'
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild {...triggerProps}>
            <p className='truncate font-medium w-full text-left'>{milestone.name}</p>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p>{milestone.name}</p>
          </TooltipContent>
        </Tooltip>

        {isActive && canDelete ? (
          <button
            type='button'
            className='pointer-events-auto cursor-pointer hover:text-destructive'
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isDeletingMilestone}
          >
            <XIcon className='size-4' />
          </button>
        ) : null}
      </div>
    </TabsTrigger>
  )
}
