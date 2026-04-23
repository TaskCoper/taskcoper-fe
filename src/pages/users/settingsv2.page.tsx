import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import ConnectedAppsSection from '@/features/users/components/connected-apps-section'
import PasswordSection from '@/features/users/components/password-section'
import ProfileSection from '@/features/users/components/profile-section'
import { cn } from '@/shared/utils'
import { InfoIcon, LockKeyholeIcon, PuzzleIcon, SearchIcon, type LucideIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'

type Section = 'profile' | 'password' | 'apps'

const sections: Section[] = ['profile', 'password', 'apps']

type SectionMeta = {
  titleKey: string
  descriptionKey: string
}

const accountCenterMeta: SectionMeta = {
  titleKey: 'user.settings.accountCenterTitle',
  descriptionKey: 'user.settings.accountCenterDesc'
}

const otherSettingsMeta: SectionMeta = {
  titleKey: 'user.settings.otherSettingsTitle',
  descriptionKey: 'user.settings.otherSettingsDesc'
}

type SectionItemConfig = {
  key: Section
  nameKey: string
  icon: LucideIcon
  content: React.ReactNode
}

type SectionGroupConfig = {
  meta?: SectionMeta
  items: SectionItemConfig[]
}

const sectionGroups: SectionGroupConfig[] = [
  {
    meta: accountCenterMeta,
    items: [
      {
        key: 'profile',
        nameKey: 'user.profileDialog.profileAndDisplay',
        icon: InfoIcon,
        content: <ProfileSection />
      },
      {
        key: 'password',
        nameKey: 'user.profileDialog.password',
        icon: LockKeyholeIcon,
        content: <PasswordSection />
      }
    ]
  },
  {
    meta: otherSettingsMeta,
    items: [
      {
        key: 'apps',
        nameKey: 'user.profileDialog.connectedApps',
        icon: PuzzleIcon,
        content: <ConnectedAppsSection />
      }
    ]
  }
]

const sectionConfig = {} as Record<Section, Omit<SectionItemConfig, 'key'>>

for (const group of sectionGroups) {
  for (const item of group.items) {
    sectionConfig[item.key] = {
      nameKey: item.nameKey,
      icon: item.icon,
      content: item.content
    }
  }
}

export default function SettingsV2Page() {
  const { t } = useTranslation()
  const [sectionValue, setSection] = useQueryState('section', parseAsStringEnum(sections).withDefault('profile'))
  const section = sectionValue as Section
  const selectedSectionConfig = sectionConfig[section]

  return (
    <div className='h-full min-h-0 flex overflow-hidden'>
      <div className='grid grid-cols-5 flex-1 h-full min-h-0 overflow-hidden'>
        <div className='bg-muted/40 flex flex-col items-start p-4 gap-3 col-span-1 border-r border-border'>
          <p className='text-xl font-semibold'>{t('account.settings')}</p>
          <InputGroup className='w-full h-8'>
            <InputGroupInput placeholder={t('user.settings.searchSettings')} />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <div className='space-y-4 w-full mt-8'>
            {sectionGroups.map((group, groupIndex) => (
              <div key={group.meta?.titleKey ?? `group-${groupIndex}`} className='space-y-1'>
                {group.meta ? (
                  <div className='mb-4'>
                    <p className='font-semibold'>{t(group.meta.titleKey)}</p>
                    <p className='text-xs text-muted-foreground'>{t(group.meta.descriptionKey)}</p>
                  </div>
                ) : null}

                {group.items.map((item) => {
                  const config = sectionConfig[item.key]

                  return (
                    <button
                      key={item.key}
                      className={cn(
                        'cursor-pointer flex items-center justify-start gap-2 w-full px-2 py-1.5 rounded-md',
                        section === item.key ? 'bg-foreground/5' : 'hover:bg-muted/50'
                      )}
                      onClick={() => setSection(item.key)}
                      aria-label={t(config.nameKey)}
                      title={t(config.nameKey)}
                    >
                      <config.icon
                        className={cn('size-4 text-foreground/70', section === item.key && 'text-primary')}
                      />
                      <p className={cn('text-sm', section === item.key && 'text-primary font-medium')}>
                        {t(config.nameKey)}
                      </p>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className='col-span-4 flex-1 p-6 bg-muted h-full min-h-0 overflow-y-auto'>
          <div className='max-w-2xl mx-auto bg-muted'>
            <Card className='shadow-none border-none p-6'>{selectedSectionConfig?.content}</Card>
          </div>
        </div>
      </div>
    </div>
  )
}
