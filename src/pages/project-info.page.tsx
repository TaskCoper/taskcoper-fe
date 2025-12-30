import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import InviteMembersDialog from '@/features/projects/components/invite-members-dialog'
import { useGetProjectMembers } from '@/features/projects/hooks/use-get-project-members'
import { UserRoundPlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

export default function ProjectInfoPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const { members, isLoadingMembers } = useGetProjectMembers({ projectId })

  // const { project, isLoadingProject } = useGetProject({ projectId })

  return (
    <div className='grid grid-cols-12 gap-4 p-4'>
      <div className='col-span-8'>
        <div className='relative h-52'>
          <img
            src='https://ideas.darden.virginia.edu/sites/default/files/styles/full_width_1024px_5_3_/public/2024-09/AI%20ART%20ITA.jpg?itok=CIaF2iIX'
            alt='Project Cover'
            className='size-full object-cover rounded-xl'
          />

          <img
            src='https://statusneo.com/wp-content/uploads/2023/02/MicrosoftTeams-image551ad57e01403f080a9df51975ac40b6efba82553c323a742b42b1c71c1e45f1.jpg'
            alt='Project Logo'
            className='absolute -bottom-12 left-8 size-32 rounded-2xl border-4 border-background object-cover shadow-sm'
          />
        </div>

        <div className='px-8 pt-14 pb-4'>
          <p className='text-4xl font-bold text-foreground'>TaskCoper</p>
        </div>
      </div>

      <div className='col-span-4 space-y-4'>
        <div>
          <p className='text-xl font-bold'>{t('project.info.members')}</p>
          <p className='text-sm text-muted-foreground'>{t('project.info.memberDescription')}</p>
        </div>

        <div className='space-y-2'>
          {isLoadingMembers ? (
            <>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </>
          ) : (
            <div className='space-y-1'>
              {members?.value.items.map((member) => (
                <div
                  key={member.userId}
                  className='flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer'
                >
                  <Avatar className='size-9'>
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
          )}

          {projectId ? (
            <InviteMembersDialog projectId={projectId}>
              <Button variant='secondary' className='w-full'>
                <UserRoundPlusIcon />
                {t('project.info.inviteMembers')}
              </Button>
            </InviteMembersDialog>
          ) : null}
        </div>
      </div>
    </div>
  )
}
