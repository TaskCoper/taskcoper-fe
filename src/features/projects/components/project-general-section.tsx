import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpenIcon, MailIcon, PhoneIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProjectGeneralSectionProps {
  teamSize: number | null
  teamContact: string | null
  teamEmail: string | null
  schoolSubject: string | null
}

export default function ProjectGeneralSection({
  teamSize,
  teamContact,
  teamEmail,
  schoolSubject
}: ProjectGeneralSectionProps) {
  const { t } = useTranslation()

  const items = [
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
    {
      label: t('project.info.schoolSubject'),
      value: schoolSubject,
      icon: BookOpenIcon
    }
  ]

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{t('project.info.general')}</p>
          <p className='text-xs text-muted-foreground'>{t('project.info.generalDescription')}</p>
        </div>

        <Button variant='ghost' size='icon-sm'>
          <SettingsIcon />
        </Button>
      </div>

      <Card className='shadow-none p-0'>
        <div className='divide-y divide-border/50'>
          {items.map((item, index) => (
            <div
              key={index}
              className='flex items-center justify-between pl-2 pr-3 py-2 hover:bg-muted/40 transition-colors group'
            >
              <div className='flex items-center gap-2.5 text-muted-foreground'>
                <div className='p-1.5 rounded-sm bg-muted/50 group-hover:bg-background transition-colors'>
                  <item.icon className='size-3.5' />
                </div>
                <span className='text-xs font-medium'>{item.label}</span>
              </div>

              <span className='text-xs font-semibold text-foreground max-w-[140px] truncate' title={String(item.value)}>
                {item.value ?? <span className='text-muted-foreground/40'>—</span>}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
