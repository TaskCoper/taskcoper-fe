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
import { Skeleton } from '@/components/ui/skeleton'
import TaskCard from '@/features/tasks/components/task-card'
import { useGetMyAssignedTasks } from '@/features/tasks/hooks/use-get-my-assigned-tasks'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { cn } from '@/shared/utils'
import {
  BanknoteIcon,
  CalendarClockIcon,
  DatabaseIcon,
  GaugeIcon,
  InfoIcon,
  ListTodoIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  SettingsIcon,
  SmileIcon
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router'

interface ProjectDetailSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onTaskCountChange?: (count: number, isLoading: boolean) => void
}

export default function ProjectDetailSidebar({ onTaskCountChange, ...props }: ProjectDetailSidebarProps) {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuthStore()
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
        title: t('project.sidebar.performance'),
        url: 'performance',
        icon: GaugeIcon,
        hasSecondSidebar: false
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
        title: t('project.sidebar.storage'),
        url: 'storage',
        icon: DatabaseIcon,
        hasSecondSidebar: false
      },
      {
        title: 'Revenue',
        url: 'revenue',
        icon: BanknoteIcon,
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

  const { assignedTasks, isLoadingAssignedTasks } = useGetMyAssignedTasks({
    projectId,
    userId: user?.UserId,
    enabled: activeItem.hasSecondSidebar
  })

  useEffect(() => {
    if (onTaskCountChange) {
      onTaskCountChange(assignedTasks?.value.totalCount ?? 0, isLoadingAssignedTasks)
    }
  }, [assignedTasks?.value.totalCount, isLoadingAssignedTasks, onTaskCountChange])

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
        {/* <SidebarHeader>
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
        </SidebarHeader> */}
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

      {activeItem.hasSecondSidebar ? (
        <Sidebar collapsible='none' className='hidden w-[340px] md:flex shrink-0'>
          <SidebarHeader className='gap-3.5 border-b p-4'>
            <div className='flex w-full items-center justify-between'>
              <div className='text-foreground text-base font-medium'>{activeItem?.title}</div>
            </div>
            <SidebarInput placeholder={t('common.ui.search')} />
          </SidebarHeader>
          <SidebarContent className='bg-muted'>
            <SidebarGroup className='p-0'>
              <SidebarGroupContent>
                <div className='p-4 flex flex-col gap-4 shrink-0'>
                  {isLoadingAssignedTasks ? (
                    <>
                      <Skeleton className='h-20' />
                      <Skeleton className='h-20' />
                      <Skeleton className='h-20' />
                    </>
                  ) : assignedTasks?.value.totalCount === 0 ? (
                    <div className='flex flex-col justify-center items-center gap-3 mt-10'>
                      <SmileIcon className='size-14 text-muted-foreground' />
                      <p className='text-muted-foreground text-sm'>{t('project.sidebar.noPendingTasks')}</p>
                    </div>
                  ) : (
                    assignedTasks?.value.items.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      ) : null}
    </Sidebar>
  )
}
