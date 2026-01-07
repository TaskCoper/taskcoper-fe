import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useGetProjectMembers } from '@/features/projects/hooks/use-get-project-members'
import { getAvatarFallback } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { useAssignMember } from '../hooks/use-assign-member'
import { useGetTaskMembers } from '../hooks/use-get-task-members'
import { useUnassignMember } from '../hooks/use-unassign-member'

interface AssigneePopoverProps {
  children: React.ReactNode
  projectId: string
  taskId: string
  parentMilestoneId: string
}

// display project members and task members
// when user is not searching then the assigned members will not be displayed in the project members section
// when user is searching the assigned members still appear in the result but with a remove button
// if all projects members are assigned then the project members section will not be displayed

export default function AssigneePopover({ children, projectId, taskId, parentMilestoneId }: AssigneePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const { members, isLoadingMembers } = useGetProjectMembers({
    projectId,
    searchTerm: debouncedSearchTerm ? debouncedSearchTerm : undefined
  })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId })

  const { assignMember, isAssigningMember } = useAssignMember({ taskId, projectId, parentMilestoneId })
  const { unassignMember, isUnassigningMember } = useUnassignMember({ taskId, projectId, parentMilestoneId })

  const taskMemberIds = useMemo(
    () => new Set(taskMembers?.value.items.map((m) => m.userId) ?? []),
    [taskMembers?.value.items]
  )

  const isSearching = debouncedSearchTerm.length > 0

  const filteredMembers = useMemo(
    () => members?.value.items.filter((member) => (isSearching ? true : !taskMemberIds.has(member.userId))) ?? [],
    [members?.value.items, isSearching, taskMemberIds]
  )

  const hasTaskMembers = (taskMembers?.value.totalCount ?? 0) > 0
  const showProjectMembersSection = isLoadingMembers || filteredMembers.length > 0
  const showTaskMembersSection = hasTaskMembers && !isSearching

  const handleAssignMember = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation()
    assignMember({ taskId, userId: memberId })
  }

  const handleUnassignMember = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation()
    unassignMember({ id: taskId, userId: memberId })
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align='start' className='p-0 max-h-[420px] overflow-auto' onInteractOutside={handleClose}>
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
                              if (!isUnassigningMember) handleUnassignMember(e, member.userId)
                            } else {
                              if (!isAssigningMember) handleAssignMember(e, member.userId)
                            }
                          }}
                          key={member.userId}
                          className={`flex items-center gap-2.5 rounded-sm p-1 transition-opacity ${
                            isAssigningMember || isUnassigningMember
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <Avatar>
                            <AvatarImage src={member.avatar || ''} alt={member.fullName} />
                            <AvatarFallback>{getAvatarFallback(member.fullName)}</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>{member.fullName}</p>
                            <p className='text-xs text-muted-foreground'>{member.email}</p>
                          </div>
                          {isAlreadyAssigned && (
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              className='size-6'
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isUnassigningMember) handleUnassignMember(e, member.userId)
                              }}
                              disabled={isUnassigningMember}
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
                    taskMembers?.value.items.map((taskMember) => (
                      <div
                        role='button'
                        key={taskMember.userId}
                        className='flex items-center gap-2.5 hover:bg-muted cursor-pointer rounded-sm p-1 w-full'
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

                        <Button
                          variant='ghost'
                          size='icon-sm'
                          className='size-6'
                          onClick={(e) => handleUnassignMember(e, taskMember.userId)}
                          disabled={isUnassigningMember}
                        >
                          <XIcon />
                        </Button>
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
