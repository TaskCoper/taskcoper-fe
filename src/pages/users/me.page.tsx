import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { UNDERLINE_TAB_CLASSNAME } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { ImageOffIcon, SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

type TabValue = 'all' | 'info' | 'projects' | 'files'

interface TabItem {
  id: number
  label: string
  value: TabValue
  content: React.ReactNode
}

export default function MePage() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()

  useEffect(() => {
    if (me) {
      document.title = `${me?.firstName} ${me?.lastName} | TaskCoper`
    }
  }, [me])

  const tabs: TabItem[] = [
    {
      id: 1,
      label: t('user.tabs.all'),
      value: 'all',
      content: <div>Comming Soon</div>
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

  const [activeTab, setActiveTab] = useState<TabItem>(tabs[0])

  const navigate = useNavigate()

  if (isGettingMe) {
    return (
      <div className='w-full h-full overflow-y-auto'>
        <div className='bg-muted/30 pt-4'>
          <div className='max-w-5xl mx-auto'>
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
                <Skeleton className='size-8 rounded-md' />
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-5xl mx-auto py-4 space-y-4'>
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
      onValueChange={(v) => setActiveTab(tabs.find((t) => t.value === v) ?? tabs[0])}
    >
      <div className='bg-muted/30 pt-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='relative h-48 sm:h-52'>
            <div className='size-full relative'>
              {/* TODO: need cover image */}
              {/* {me?.avatar ? (
                  <img
                    src={me.avatar}
                    alt={`${me.firstName} ${me.lastName} Cover`}
                    className='size-full object-cover rounded-2xl'
                  />
                ) : ( */}
              <div className='size-full rounded-2xl bg-muted-foreground/15 flex items-center justify-center'></div>
              {/* )} */}
            </div>

            <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 size-28 lg:size-32 z-20 rounded-2xl border-4 border-background bg-muted shadow-sm'>
              {me?.avatar ? (
                <img
                  src={me.avatar}
                  alt={t('user.logoImageAlt', { name: `${me.firstName} ${me.lastName}` })}
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
              <h1 className='text-2xl sm:text-3xl font-semibold wrap-break-word'>
                {me?.firstName} {me?.lastName}
              </h1>
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

              <Button variant='secondary' size='icon-sm' onClick={() => navigate('/me/settings')}>
                <SettingsIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full max-w-5xl mx-auto py-2'>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
