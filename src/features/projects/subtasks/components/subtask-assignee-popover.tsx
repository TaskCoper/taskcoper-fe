import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, getAvatarFallback } from '@/shared/utils'
import { CheckIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { useGetProjectMembers } from '../../members/hooks/use-get-project-members'
import { useAssignSubtaskMember } from '../hooks/use-assign-subtask-member'
import { useUnassignSubtaskMember } from '../hooks/use-unassign-subtask-member'

interface SubtaskAssigneePopoverProps {
  children: React.ReactNode
  taskId: string
  subtaskId: string
  projectIdentifier: string
  assignedUserIds?: string[]
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  triggerTooltip?: React.ReactNode
}

export default function SubtaskAssigneePopover({
  children,
  taskId,
  subtaskId,
  projectIdentifier,
  assignedUserIds = [],
  disabled = false,
  onOpenChange,
  triggerTooltip
}: SubtaskAssigneePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const { members, isLoadingMembers } = useGetProjectMembers({
    identifier: projectIdentifier,
    searchTerm: debouncedSearchTerm ? debouncedSearchTerm : undefined,
    enabled: open
  })

  const { assignSubtaskMember, isAssigningSubtaskMember } = useAssignSubtaskMember({
    taskId
  })

  const { unassignSubtaskMember, isUnassigningSubtaskMember } = useUnassignSubtaskMember({
    taskId
  })

  const filteredMembers = useMemo(() => members?.value.items ?? [], [members?.value.items])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (!nextOpen) {
      setSearchTerm('')
    }
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  const handleAssign = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    if (isAssigningSubtaskMember || isUnassigningSubtaskMember) return

    assignSubtaskMember({
      body: {
        subtaskId,
        userId
      }
    })
  }

  const handleUnassign = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    if (isAssigningSubtaskMember || isUnassigningSubtaskMember) return

    unassignSubtaskMember({
      body: {
        subtaskId,
        userId
      }
    })
  }

  return (
    <Popover modal open={open} onOpenChange={handleOpenChange}>
      {triggerTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild disabled={disabled}>
              {children}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{triggerTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild disabled={disabled}>
          {children}
        </PopoverTrigger>
      )}
      <PopoverContent
        sideOffset={8}
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        onInteractOutside={handleClose}
      >
        <div className='p-4 space-y-4'>
          <div className='flex items-center justify-center relative'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.assignee.assignee')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          <div className='space-y-3'>
            <Input
              placeholder={t('task.assignee.findAssignee')}
              autoFocus
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-foreground/60'>{t('task.assignee.boardAssignee')}</p>
              <div className='space-y-1'>
                {isLoadingMembers ? (
                  <div className='flex justify-center items-center gap-2 my-8'>
                    <Spinner />
                  </div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const isAssigned = assignedUserIds.includes(member.userId)
                    return (
                      <div
                        role='button'
                        key={member.userId}
                        onClick={(e) => {
                          if (isAssigned) {
                            handleUnassign(e, member.userId)
                            return
                          }
                          handleAssign(e, member.userId)
                        }}
                        className={cn(
                          'flex items-center gap-2.5 rounded-sm p-1 transition-opacity',
                          isAssigningSubtaskMember || isUnassigningSubtaskMember
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted cursor-pointer'
                        )}
                      >
                        <Avatar>
                          <AvatarImage src={member.avatar || ''} alt={member.fullName} />
                          <AvatarFallback>{getAvatarFallback(member.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 truncate'>
                          <p className='text-sm font-medium truncate'>{member.fullName}</p>
                          <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
                        </div>
                        {isAssigned ? (
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            className='size-6'
                            disabled={isUnassigningSubtaskMember}
                          >
                            <XIcon />
                          </Button>
                        ) : isAssigningSubtaskMember ? (
                          <Button variant='ghost' size='icon-sm' className='size-6 text-primary' disabled>
                            <CheckIcon />
                          </Button>
                        ) : null}
                      </div>
                    )
                  })
                ) : (
                  <p className='text-xs text-center text-muted-foreground my-4'>{t('common.ui.noResults')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
