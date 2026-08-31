import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { BookOpenIcon, MailIcon, PhoneIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UpdateProjectGeneralDialog from '../dialogs/update-project-general-dialog'

interface ProjectGeneralSectionProps {
  teamSize: string | null
  teamContact: string | null
  teamEmail: string | null
  schoolSubject: string | null
  isPending: boolean
  isCurrentUserMain: boolean
}

export default function ProjectGeneralSection({
  teamSize,
  teamContact,
  teamEmail,
  schoolSubject,
  isPending,
  isCurrentUserMain
}: ProjectGeneralSectionProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const getItems = () => {
    return [
      {
        label: t('project.info.teamSize'),
        value: teamSize,
        icon: UsersIcon
      },
      {
        label: t('project.info.teamContact'),
        value: teamContact,
        icon: PhoneIcon
      },
      {
        label: t('project.info.teamEmail'),
        value: teamEmail,
        icon: MailIcon
      },
      ...(user?.organizationId
        ? [
            {
              label: t('project.info.schoolSubject'),
              value: schoolSubject,
              icon: BookOpenIcon
            }
          ]
        : [])
    ]
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{t('project.info.general')}</p>
          <p className='text-xs text-muted-foreground'>{t('project.info.generalDescription')}</p>
        </div>

        {isCurrentUserMain ? (
          <UpdateProjectGeneralDialog isPending={isPending}>
            <Button variant='ghost' size='icon-sm' type='button' disabled={isPending}>
              <SettingsIcon />
            </Button>
          </UpdateProjectGeneralDialog>
        ) : null}
      </div>

      <div className='space-y-4 mt-4'>
        {getItems().map((item, index) => (
          <div key={index} className='flex items-center justify-between hover:bg-muted/40 transition-colors group'>
            <div className='flex items-center gap-2.5 text-muted-foreground'>
              <item.icon className='size-4' />
              <p className='text-xs font-medium'>{item.label}</p>
            </div>

            <p className='text-xs font-semibold max-w-[70%] truncate' title={String(item.value)}>
              {item.value ?? <span className='text-muted-foreground/40'>-</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
