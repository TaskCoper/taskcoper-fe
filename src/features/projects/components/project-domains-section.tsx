import { Button } from '@/components/ui/button'
import type { ProjectDomain } from '@/types/project.type'
import { SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UpdateProjectDomainsDialog from './update-project-domains-dialog'

interface ProjectDomainsSectionProps {
  domains: ProjectDomain[]
  isPending: boolean
}

export default function ProjectDomainsSection({ domains, isPending }: ProjectDomainsSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{t('project.info.domains')}</p>
          <p className='text-xs text-muted-foreground'>{t('project.info.domainDescription')}</p>
        </div>

        <UpdateProjectDomainsDialog isPending={isPending}>
          <Button variant='ghost' size='icon-sm' type='button'>
            <SettingsIcon />
          </Button>
        </UpdateProjectDomainsDialog>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        {domains.map((domain) => (
          <div className='rounded-sm bg-primary text-white px-2 py-1' key={domain.id}>
            <p className='text-xs font-medium'>{domain.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
