import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AllTab from '@/features/users/components/tabs/all-tab'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { UNDERLINE_TAB_CLASSNAME } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { BadgeCheckIcon, GlobeIcon, ImageOffIcon, MailIcon, PhoneIcon, SettingsIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

type TabValue = 'all' | 'info' | 'projects' | 'files'

interface TabItem {
  id: number
  label: string
  value: TabValue
  content: React.ReactNode
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuthStore()
  const isOwnProfile = userId === me?.UserId

  const { user, isGettingUser } = useGetUser({ userId })

  useEffect(() => {
    if (user) {
      document.title = `${user.firstName} ${user.lastName} | TaskCoper`
    }
  }, [user])

  const tabs: TabItem[] = useMemo(() => {
    return [
      {
        id: 1,
        label: t('user.tabs.all'),
        value: 'all',
        content: <AllTab userId={userId!} />
      },
      {
        id: 50,
        label: t('user.tabs.info'),
        value: 'info',
        content: <div>Comming Soon</div>
      },
      {
        id: 100,
        label: t('user.tabs.projects'),
        value: 'projects',
        content: <div>Comming Soon</div>
      },
      {
        id: 150,
        label: t('user.tabs.files'),
        value: 'files',
        content: <div>Comming Soon</div>
      }
    ]
  }, [t, userId])

  const [activeTab, setActiveTab] = useState<TabItem>(tabs[0])

  if (isGettingUser) {
    return (
      <div className='w-full h-full overflow-y-auto'>
        <div className='bg-muted/40 pt-4'>
          <div className='max-w-7xl mx-auto'>
            <div className='relative h-48 sm:h-52'>
              <Skeleton className='size-full rounded-2xl' />
              <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 z-20'>
                <Skeleton className='size-28 lg:size-32 rounded-2xl border-4 border-background' />
              </div>
            </div>

            <div className='mt-16 flex flex-col items-center lg:items-start space-y-2'>
              <div className='lg:px-6 w-full mb-4 space-y-2'>
                <Skeleton className='h-8 w-48 mx-auto lg:mx-0' />
              </div>

              <Separator className='bg-foreground/10' />

              <div className='flex items-center justify-between w-full pb-2'>
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-20 rounded-md' />
                  <Skeleton className='h-8 w-20 rounded-md' />
                  <Skeleton className='h-8 w-20 rounded-md' />
                  <Skeleton className='h-8 w-20 rounded-md' />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-7xl mx-auto py-4 space-y-4'>
          <Skeleton className='h-32 w-full rounded-lg' />
          <Skeleton className='h-24 w-full rounded-lg' />
        </div>
      </div>
    )
  }

  return (
    <Tabs
      className='w-full h-full overflow-y-auto'
      value={activeTab.value}
      onValueChange={(v) => setActiveTab(tabs.find((tab) => tab.value === v) ?? tabs[0])}
    >
      <div className='bg-muted/40'>
        <div className='max-w-7xl mx-auto px-4 pt-4'>
          <div className='relative h-48 sm:h-52'>
            <div className='size-full relative'>
              {/* TODO: need cover image */}
              <div className='size-full rounded-2xl bg-muted-foreground/15 flex items-center justify-center'></div>
            </div>

            <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 size-28 lg:size-32 z-20 rounded-2xl border-4 border-background bg-muted shadow-sm'>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={t('user.logoImageAlt', { name: `${user.firstName} ${user.lastName}` })}
                  className='size-full object-cover rounded-xl'
                />
              ) : (
                <div className='size-full flex items-center justify-center'>
                  <ImageOffIcon className='size-8 text-muted-foreground' />
                </div>
              )}
            </div>
          </div>

          <div className='mt-16 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2'>
            <div className='lg:px-6 w-full mb-4'>
              <div className='flex items-center gap-3'>
                <p className='text-2xl sm:text-3xl font-semibold wrap-break-word'>
                  {user?.firstName} {user?.lastName}
                </p>

                {user?.mentor && (
                  <div className='flex items-center gap-1.5 bg-primary px-1.5 py-1 rounded-md'>
                    <BadgeCheckIcon className='size-3.5 text-white' />
                    <p className='text-xs text-white font-medium'>Kiểm định bởi TaskCoper</p>
                  </div>
                )}
              </div>

              <div className='flex items-center gap-2 mb-4'>
                {user?.email ? (
                  <div className='flex items-center gap-1.5'>
                    <MailIcon className='size-3.5' />
                    <p className='text-sm text-foreground/80'>{user?.email}</p>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>Chưa có email</p>
                )}

                <div className='w-px h-4 bg-muted-foreground/50' />

                {user?.phoneNumber ? (
                  <div className='flex items-center gap-1.5'>
                    <PhoneIcon className='size-3.5' />
                    <p className='text-sm text-foreground/80'>{user?.phoneNumber}</p>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>Chưa có số điện thoại</p>
                )}

                <div className='w-px h-4 bg-muted-foreground/50' />

                <div className='flex items-center gap-1.5'>
                  <GlobeIcon className='size-3.5' />
                  <p className='text-sm text-foreground/80'>{user?.timeZone}</p>
                </div>
              </div>

              {user?.mentor && (
                <div className='flex items-center gap-2'>
                  <p>{user.mentor.shortBio}</p>
                </div>
              )}
            </div>

            <Separator className='bg-foreground/10' />

            <div className='flex items-start justify-between w-full'>
              <TabsList className={cn(UNDERLINE_TAB_CLASSNAME.TabList, 'w-fit border-b-transparent')}>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.value}
                    className={cn(UNDERLINE_TAB_CLASSNAME.TabTrigger, 'data-[state=active]:bg-transparent')}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {isOwnProfile && (
                <Button variant='secondary' size='icon-sm' onClick={() => navigate(`/users/${me?.UserId}/settings`)}>
                  <SettingsIcon />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='w-full max-w-7xl mx-auto py-2'>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.value} className='px-4'>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
