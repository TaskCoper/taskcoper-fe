import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProjectInfoTab from '@/features/projects/core/components/project-info-tab'
import { useGetProject } from '@/features/projects/core/hooks/use-get-project'
import ProjectRequestsTab from '@/features/projects/members/components/project-invitations-tab'
import ProjectMembersTab from '@/features/projects/members/components/project-members-tab'
import ProjectPermissionsTab from '@/features/projects/roles/components/project-permissions-tab'
import { InfoIcon, KeySquareIcon, MailIcon, UsersRoundIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router'

export default function ProjectSettingsPage() {
  const { t } = useTranslation()
  const { identifier } = useParams<{ identifier: string }>()

  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'info'

  const { project } = useGetProject({ identifier })

  const TABS = [
    {
      value: 'info',
      label: t('project.settings.tabs.info'),
      icon: <InfoIcon />,
      content: <ProjectInfoTab projectIdentifier={identifier} />
    },
    {
      value: 'members',
      label: t('project.settings.tabs.members'),
      icon: <UsersRoundIcon />,
      content: <ProjectMembersTab projectIdentifier={identifier} />
    },
    {
      value: 'invites',
      label: t('project.settings.tabs.invites'),
      icon: <MailIcon />,
      content: <ProjectRequestsTab projectIdentifier={identifier} />
    },
    {
      value: 'permissions',
      label: t('project.settings.tabs.permissions'),
      icon: <KeySquareIcon />,
      content: <ProjectPermissionsTab projectIdentifier={identifier} />
    }
  ]

  return (
    <div className='absolute inset-0 flex flex-col overflow-hidden bg-background'>
      <Tabs
        value={currentTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
        className='flex flex-1 flex-col min-h-0'
      >
        <div className='bg-muted/50 px-6 pt-6 space-y-6 border-b'>
          <div>
            <h1 className='text-2xl font-bold'>{project?.name}</h1>
            <p className='text-sm text-muted-foreground'>{t('project.settings.description')}</p>
          </div>

          <TabsList className='w-full justify-start rounded-none p-0 bg-transparent gap-6 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='w-40 flex-none shrink-0 relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold'
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className='px-6 pb-20 pt-3 focus-visible:outline-hidden m-0'>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
