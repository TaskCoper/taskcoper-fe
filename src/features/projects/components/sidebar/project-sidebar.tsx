import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/shared/utils'
import {
  CalendarClockIcon,
  Command,
  InfoIcon,
  ListTodoIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  SettingsIcon
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router'

const mails = [
  {
    name: 'William Smith',
    email: 'williamsmith@example.com',
    subject: 'Meeting Tomorrow',
    date: '09:34 AM',
    teaser:
      'Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.'
  },
  {
    name: 'Alice Smith',
    email: 'alicesmith@example.com',
    subject: 'Re: Project Update',
    date: 'Yesterday',
    teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps."
  }
]

export default function ProjectSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()

  const navMain = useMemo(
    () => [
      {
        title: t('project.sidebar.aboutProject'),
        url: 'info',
        icon: InfoIcon,
        hasSecondSidebar: false
      },
      {
        title: t('project.sidebar.tasks'),
        url: 'milestones',
        icon: ListTodoIcon,
        hasSecondSidebar: true
      },
      {
        title: t('project.sidebar.calendar'),
        url: 'calendar',
        icon: CalendarClockIcon,
        hasSecondSidebar: false
      },
      {
        title: t('project.sidebar.chat'),
        url: 'chat',
        icon: MessageCircleIcon,
        hasSecondSidebar: false
      },
      {
        title: t('project.sidebar.note'),
        url: 'note',
        icon: NotebookPenIcon,
        hasSecondSidebar: false
      },
      {
        title: t('project.sidebar.settings'),
        url: 'settings',
        icon: SettingsIcon,
        hasSecondSidebar: false
      }
    ],
    [t]
  )

  const activeSegment = useMemo(() => {
    const parts = location.pathname.split('/')
    const projectIndex = parts.findIndex((p) => p === 'projects')
    if (projectIndex !== -1 && parts.length > projectIndex + 2) {
      return parts[projectIndex + 2]
    }
    return 'milestones'
  }, [location.pathname])

  const activeItem = navMain.find((item) => item.url === activeSegment) || navMain[1]

  return (
    <Sidebar
      collapsible='icon'
      className={cn(
        'overflow-hidden *:data-[sidebar=sidebar]:flex-row',
        'top-14 h-[calc(100svh-3.5rem)]! border-r-0',
        props.className
      )}
      {...props}
    >
      <Sidebar collapsible='none' className='w-[calc(var(--sidebar-width-icon)+1px)]! border-r'>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' asChild className='md:h-8 md:p-0'>
                <a href='#'>
                  <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                    <Command className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-medium'>Acme Inc</span>
                    <span className='truncate text-xs'>Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className='px-1.5 md:px-0'>
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link to={`/projects/${projectId}/${item.url}`}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false
                        }}
                        className={cn('px-2.5 md:px-2', activeSegment === item.url && 'bg-primary/10 text-primary')}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 2. Secondary Sidebar (Conditional) */}
      {activeItem.hasSecondSidebar ? (
        <Sidebar collapsible='none' className='hidden flex-1 md:flex'>
          <SidebarHeader className='gap-3.5 border-b p-4'>
            <div className='flex w-full items-center justify-between'>
              <div className='text-foreground text-base font-medium'>{activeItem?.title}</div>
              <Label className='flex items-center gap-2 text-sm'>
                <span>Unreads</span>
                <Switch className='shadow-none' />
              </Label>
            </div>
            <SidebarInput placeholder='Type to search...' />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className='px-0'>
              <SidebarGroupContent>
                {mails.map((mail) => (
                  <a
                    href='#'
                    key={mail.email}
                    className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0'
                  >
                    <div className='flex w-full items-center gap-2'>
                      <span>{mail.name}</span> <span className='ml-auto text-xs'>{mail.date}</span>
                    </div>
                    <span className='font-medium'>{mail.subject}</span>
                    <span className='line-clamp-2 w-[260px] text-xs whitespace-break-spaces'>{mail.teaser}</span>
                  </a>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      ) : null}
    </Sidebar>
  )
}
