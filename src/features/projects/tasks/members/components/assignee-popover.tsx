import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useGetProjectMembers } from '@/features/projects/members/hooks/use-get-project-members'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { cn, getAvatarFallback } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { useAssignTaskMember } from '../hooks/use-assign-member'
import { useGetTaskMembers } from '../hooks/use-get-task-members'
import { useUnassignTaskMember } from '../hooks/use-unassign-task-member'

interface AssigneePopoverProps {
  children: React.ReactNode
  projectIdentifier: string
  taskId: string
  parentMilestoneIdentifier: string
  disabled?: boolean
}

// display project members and task members
// when user is not searching then the assigned members will not be displayed in the project members section
// when user is searching the assigned members still appear in the result but with a remove button
// if all projects members are assigned then the project members section will not be displayed

export default function AssigneePopover({
  children,
  projectIdentifier,
  taskId,
  parentMilestoneIdentifier,
  disabled = false
}: AssigneePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canDelete = check('TASKS', 'canDelete')

  const { members, isLoadingMembers } = useGetProjectMembers({
    identifier: projectIdentifier,
    searchTerm: debouncedSearchTerm ? debouncedSearchTerm : undefined
  })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId })

  const { assignTaskMember, isAssigningTaskMember } = useAssignTaskMember({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })
  const { unassignTaskMember, isUnassigningTaskMember } = useUnassignTaskMember({
    taskId,
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const actualTaskMembers = useMemo(
    () => taskMembers?.value.items.filter((m) => m.isMemberInTask) ?? [],
    [taskMembers?.value.items]
  )

  const taskMemberIds = useMemo(() => new Set(actualTaskMembers.map((m) => m.userId)), [actualTaskMembers])

  const isSearching = debouncedSearchTerm.length > 0

  const filteredMembers = useMemo(
    () => members?.value.items.filter((member) => (isSearching ? true : !taskMemberIds.has(member.userId))) ?? [],
    [members?.value.items, isSearching, taskMemberIds]
  )

  const hasTaskMembers = actualTaskMembers.length > 0
  const showProjectMembersSection = isLoadingMembers || filteredMembers.length > 0
  const showTaskMembersSection = hasTaskMembers && !isSearching

  const handleAssignMember = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation()
    assignTaskMember({ taskId, userId: memberId })
  }

  const handleUnassignMember = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation()
    unassignTaskMember({ id: taskId, userId: memberId })
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
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

            {/* Project members */}
            {showProjectMembersSection && (
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-foreground/60'>{t('task.assignee.boardAssignee')}</p>
                <div className='space-y-1'>
                  {isLoadingMembers ? (
                    <div className='flex justify-center items-center gap-2 my-8'>
                      <Spinner />
                    </div>
                  ) : filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                      const isAlreadyAssigned = taskMemberIds.has(member.userId)

                      return (
                        <div
                          role='button'
                          onClick={(e) => {
                            if (isAlreadyAssigned) {
                              if (!isUnassigningTaskMember && canDelete) handleUnassignMember(e, member.userId)
                            } else {
                              if (!isAssigningTaskMember) handleAssignMember(e, member.userId)
                            }
                          }}
                          key={member.userId}
                          className={cn(
                            'flex items-center gap-2.5 rounded-sm p-1 transition-opacity',
                            isAssigningTaskMember || isUnassigningTaskMember
                              ? 'opacity-50 cursor-not-allowed'
                              : isAlreadyAssigned && !canDelete
                                ? 'cursor-not-allowed opacity-70'
                                : 'hover:bg-muted cursor-pointer'
                          )}
                        >
                          <Avatar>
                            <AvatarImage src={member.avatar || ''} alt={member.fullName} />
                            <AvatarFallback>{getAvatarFallback(member.fullName)}</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>{member.fullName}</p>
                            <p className='text-xs text-muted-foreground'>{member.email}</p>
                          </div>
                          {isAlreadyAssigned && canDelete && (
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              className='size-6'
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isUnassigningTaskMember) handleUnassignMember(e, member.userId)
                              }}
                              disabled={isUnassigningTaskMember}
                            >
                              <XIcon />
                            </Button>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className='text-xs text-center text-muted-foreground my-4'>{t('common.ui.noResults')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Task members */}
            {showTaskMembersSection && (
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-foreground/60'>{t('task.assignee.taskAssignee')}</p>
                <div className='space-y-1'>
                  {isLoadingTaskMembers ? (
                    <div className='flex justify-center items-center gap-2 mt-8 mb-4'>
                      <Spinner />
                    </div>
                  ) : (
                    actualTaskMembers.map((taskMember) => (
                      <div
                        role='button'
                        key={taskMember.userId}
                        onClick={(e) => {
                          if (canDelete && !isUnassigningTaskMember) handleUnassignMember(e, taskMember.userId)
                        }}
                        className={cn(
                          'flex items-center gap-2.5 rounded-sm p-1 w-full transition-opacity',
                          !canDelete ? 'cursor-not-allowed opacity-70' : 'hover:bg-muted cursor-pointer',
                          isUnassigningTaskMember && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Avatar>
                          <AvatarImage
                            src={taskMember.avatar || ''}
                            alt={`${taskMember.firstName} ${taskMember.lastName}`}
                          />
                          <AvatarFallback>
                            {getAvatarFallback(`${taskMember.firstName} ${taskMember.lastName}`)}
                          </AvatarFallback>
                        </Avatar>

                        <div className='flex-1 truncate'>
                          <p className='text-sm font-medium truncate'>
                            {taskMember.firstName} {taskMember.lastName}
                          </p>
                          <p className='text-xs text-muted-foreground truncate'>{taskMember.email}</p>
                        </div>

                        {canDelete && (
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            className='size-6'
                            onClick={(e) => handleUnassignMember(e, taskMember.userId)}
                            disabled={isUnassigningTaskMember}
                          >
                            <XIcon />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
