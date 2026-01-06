import { TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUpdateMilestone } from '@/features/milestones/hooks/use-update-milestone'
import { updateMilestoneSchema } from '@/features/milestones/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn } from '@/shared/utils'
import type { Milestone, MilestoneTabDragData } from '@/types/milestone.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SortableMilestoneTabProps {
  milestone: Milestone
  isActive: boolean
  queryKey: unknown[]
}

export const SortableMilestoneTab = ({ milestone, isActive, queryKey }: SortableMilestoneTabProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(milestone.name)
  const { confirm } = useConfirmStore()

  const { updateMilestone } = useUpdateMilestone({ queryKey })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: milestone.id,
    data: {
      type: 'MilestoneTab',
      milestone
    } satisfies MilestoneTabDragData,
    attributes: {
      roleDescription: 'MilestoneTab'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(milestone.name)
  }

  const handleEditComplete = () => {
    const trimmedValue = editValue.trim()

    if (trimmedValue && trimmedValue !== milestone.name) {
      const validated = updateMilestoneSchema(t).safeParse({
        milestoneId: milestone.id,
        parentId: null,
        milestoneName: trimmedValue,
        position: milestone.position
      })

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
    }

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditComplete()
    } else if (e.key === 'Escape') {
      setEditValue(milestone.name)
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('milestone.deleteMilestone.title'),
      description: t('milestone.deleteMilestone.description', { milestoneName: milestone.name }),
      confirmText: t('milestone.deleteMilestone.confirmText'),
      cancelText: t('milestone.deleteMilestone.cancelText'),
      variant: 'destructive'
    })

    // TODO: need api to delete parent milestone
    if (ok) {
      console.log(milestone.id)
    }
  }

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      asChild
      {...(isEditing ? {} : { ...attributes, ...listeners })}
      value={milestone.id}
      className='shadow-none! data-[state=active]:border-2 data-[state=active]:border-primary'
    >
      {isEditing ? (
        <input
          type='text'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditComplete}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          className='w-full font-medium'
          autoFocus
        />
      ) : (
        <div className={cn('flex justify-start items-center gap-2 w-full', isActive ? 'w-auto' : 'w-52')}>
          <FolderIcon />
          <Tooltip>
            <TooltipTrigger asChild onDoubleClick={handleDoubleClick}>
              <p className='truncate font-medium'>{milestone.name}</p>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p>{milestone.name}</p>
            </TooltipContent>
          </Tooltip>
          <div className='flex-1' />
          {isActive ? (
            <button
              type='button'
              className='pointer-events-auto cursor-pointer hover:text-destructive'
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <XIcon className='size-4' />
            </button>
          ) : null}
        </div>
      )}
    </TabsTrigger>
  )
}
