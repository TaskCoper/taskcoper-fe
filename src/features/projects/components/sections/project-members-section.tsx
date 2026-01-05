import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import type { ProjectMember } from '@/types/project.type'
import { MoreHorizontalIcon, SettingsIcon, UserRoundPlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import InviteMembersDialog from '../dialogs/invite-members-dialog'
import UpdateProjectMembersDialog from '../dialogs/update-project-members-dialog'

interface ProjectMembersSectionProps {
  members: ProjectMember[]
  isCurrentUserMain: boolean
  totalMembers: number
  projectId?: string
}

export default function ProjectMembersSection({
  members,
  isCurrentUserMain,
  totalMembers,
  projectId
}: ProjectMembersSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>
            {t('project.info.members')} ({totalMembers})
          </p>
          <p className='text-xs text-muted-foreground'>{t('project.info.memberDescription')}</p>
        </div>

        {projectId ? (
          <UpdateProjectMembersDialog projectId={projectId} isCurrentUserMain={isCurrentUserMain}>
            <Button variant='ghost' size='icon-sm' type='button'>
              {isCurrentUserMain ? <SettingsIcon /> : <MoreHorizontalIcon />}
            </Button>
          </UpdateProjectMembersDialog>
        ) : null}
      </div>

      <div className='space-y-2'>
        <div>
          {members.map((member) => (
            <div
              key={member.userId}
              className='flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer'
            >
              <Avatar
                className={cn(
                  'ring-2 ring-slate-500 ring-offset-2',
                  member.isMain && 'ring-indigo-500',
                  member.isEditor && !member.isMain && 'ring-blue-500'
                )}
              >
                <AvatarImage src={member.avatar ?? ''} />
                <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <div className='flex items-center gap-1'>
                  <p className='text-sm font-medium truncate'>{member.fullName}</p>

                  <p className='text-xs text-muted-foreground'>
                    {member.isMain
                      ? `(${t('role.owner')})`
                      : member.isEditor
                        ? `(${t('role.editor')})`
                        : `(${t('role.viewer')})`}
                  </p>
                </div>
                <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
              </div>
            </div>
          ))}
        </div>

        {projectId && isCurrentUserMain ? (
          <InviteMembersDialog projectId={projectId}>
            <Button type='button' className='w-full'>
              <UserRoundPlusIcon />
              {t('project.info.inviteMembers')}
            </Button>
          </InviteMembersDialog>
        ) : null}
      </div>
    </div>
  )
}
