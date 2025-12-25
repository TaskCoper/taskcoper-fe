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
  SidebarMenuItem,
  useSidebar
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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router'

export default function ProjectSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg'
    },
    navMain: [
      {
        title: t('project.sidebar.aboutProject'),
        url: 'info',
        icon: InfoIcon
      },
      {
        title: t('project.sidebar.tasks'),
        url: 'tasks',
        icon: ListTodoIcon
      },
      {
        title: t('project.sidebar.calendar'),
        url: 'calendar',
        icon: CalendarClockIcon
      },
      {
        title: t('project.sidebar.chat'),
        url: 'chat',
        icon: MessageCircleIcon
      },
      {
        title: t('project.sidebar.note'),
        url: 'note',
        icon: NotebookPenIcon
      },
      {
        title: t('project.sidebar.settings'),
        url: 'settings',
        icon: SettingsIcon
      }
    ],
    mails: [
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
        teaser:
          "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps."
      },
      {
        name: 'Bob Johnson',
        email: 'bobjohnson@example.com',
        subject: 'Weekend Plans',
        date: '2 days ago',
        teaser:
          "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?"
      },
      {
        name: 'Emily Davis',
        email: 'emilydavis@example.com',
        subject: 'Re: Question about Budget',
        date: '2 days ago',
        teaser:
          "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?"
      },
      {
        name: 'Michael Wilson',
        email: 'michaelwilson@example.com',
        subject: 'Important Announcement',
        date: '1 week ago',
        teaser:
          "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future."
      },
      {
        name: 'Sarah Brown',
        email: 'sarahbrown@example.com',
        subject: 'Re: Feedback on Proposal',
        date: '1 week ago',
        teaser:
          "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?"
      },
      {
        name: 'David Lee',
        email: 'davidlee@example.com',
        subject: 'New Project Idea',
        date: '1 week ago',
        teaser:
          "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?"
      },
      {
        name: 'Olivia Wilson',
        email: 'oliviawilson@example.com',
        subject: 'Vacation Plans',
        date: '1 week ago',
        teaser:
          "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave."
      },
      {
        name: 'James Martin',
        email: 'jamesmartin@example.com',
        subject: 'Re: Conference Registration',
        date: '1 week ago',
        teaser:
          "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end."
      },
      {
        name: 'Sophia White',
        email: 'sophiawhite@example.com',
        subject: 'Team Dinner',
        date: '1 week ago',
        teaser:
          "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences."
      }
    ]
  }

  const [mails, setMails] = useState(data.mails)
  const { setOpen } = useSidebar()

  const getActiveSegment = () => {
    const pathname = location.pathname
    const match = pathname.match(/\/projects\/[^/]+\/([^/]+)/)
    return match ? match[1] : 'tasks'
  }

  const activeSegment = getActiveSegment()
  const activeItem = data.navMain.find((item) => item.url === activeSegment) || data.navMain[1]

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
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
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
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link to={`/projects/${projectId}/${item.url}`}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false
                        }}
                        onClick={() => {
                          const mail = data.mails.sort(() => Math.random() - 0.5)
                          setMails(mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1)))
                          setOpen(true)
                        }}
                        className={cn('px-2.5 md:px-2', activeSegment === item.url && 'bg-primary/15 text-primary')}
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

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
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
    </Sidebar>
  )
}
