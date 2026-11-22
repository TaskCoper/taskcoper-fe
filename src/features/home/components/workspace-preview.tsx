import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Folder,
  Layers,
  LayoutGrid,
  ListTodo,
  LockKeyhole,
  MessageSquare,
  Plus,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface PreviewTask {
  title: string
  label: string
  initials: string
  color: string
  comments: number
  cover?: boolean
  done?: boolean
}

function TaskCard({ task }: { task: PreviewTask }) {
  const { t } = useTranslation()
  return (
    <article className='workspace-task'>
      {task.cover ? (
        <div className='workspace-task-cover' aria-hidden='true'>
          <div className='workspace-cover-window'>
            <span />
            <span />
            <span />
          </div>
          <div className='workspace-cover-orbit' />
          <ArrowUpRight />
        </div>
      ) : null}
      <span className={`workspace-task-label ${task.color}`}>{task.label}</span>
      <h4 className={task.done ? 'workspace-task-done' : undefined}>{task.title}</h4>
      <div className='workspace-task-meta'>
        <span className={`workspace-avatar ${task.color}`}>{task.initials}</span>
        <span className='workspace-task-date'>
          {task.done ? <CheckCircle2 /> : <CalendarDays />}
          {task.done ? t('home.landing.demo.finished') : t('home.landing.demo.thisWeek')}
        </span>
        <span className='workspace-task-comments'>
          <MessageSquare aria-hidden='true' />
          <span className='sr-only'>{t('home.landing.demo.comments')}</span>
          {task.comments}
        </span>
      </div>
    </article>
  )
}

export default function WorkspacePreview() {
  const { t } = useTranslation()
  const tasks: PreviewTask[] = [
    {
      title: t('home.landing.demo.tasks.research'),
      label: t('home.landing.demo.labels.planning'),
      initials: 'LN',
      color: 'violet',
      comments: 2
    },
    {
      title: t('home.landing.demo.tasks.content'),
      label: t('home.landing.demo.labels.content'),
      initials: 'MA',
      color: 'amber',
      comments: 3
    },
    {
      title: t('home.landing.demo.tasks.design'),
      label: t('home.landing.demo.labels.design'),
      initials: 'KH',
      color: 'blue',
      comments: 5,
      cover: true
    },
    {
      title: t('home.landing.demo.tasks.development'),
      label: t('home.landing.demo.labels.development'),
      initials: 'LN',
      color: 'violet',
      comments: 2
    },
    {
      title: t('home.landing.demo.tasks.kickoff'),
      label: t('home.landing.demo.labels.planning'),
      initials: 'MA',
      color: 'mint',
      comments: 4,
      done: true
    },
    {
      title: t('home.landing.demo.tasks.brand'),
      label: t('home.landing.demo.labels.design'),
      initials: 'KH',
      color: 'blue',
      comments: 2,
      done: true
    }
  ]
  const columns = [
    { title: t('home.landing.demo.todo'), icon: Circle, className: 'todo', tasks: tasks.slice(0, 2) },
    { title: t('home.landing.demo.inProgress'), icon: Clock3, className: 'progress', tasks: tasks.slice(2, 4) },
    { title: t('home.landing.demo.done'), icon: CheckCircle2, className: 'done', tasks: tasks.slice(4, 6) }
  ]
  const weekdays = [
    t('home.landing.demo.days.mon'),
    t('home.landing.demo.days.tue'),
    t('home.landing.demo.days.wed'),
    t('home.landing.demo.days.thu'),
    t('home.landing.demo.days.fri')
  ]
  return (
    <div className='workspace-preview' id='product'>
      <div className='workspace-browser-bar'>
        <div className='workspace-window-dots' aria-hidden='true'>
          <i />
          <i />
          <i />
        </div>
        <span>
          <LockKeyhole aria-hidden='true' />
          {t('home.landing.demo.workspaceAddress')}
        </span>
        <span className='workspace-demo-label'>{t('home.landing.demo.sample')}</span>
      </div>
      <div className='workspace-app'>
        <aside className='workspace-sidebar' aria-hidden='true'>
          <div className='workspace-team'>
            <span className='workspace-team-icon'>
              <Layers />
            </span>
            <span>
              {t('home.landing.demo.team')}
              <small>{t('home.landing.demo.workspace')}</small>
            </span>
            <ChevronDown />
          </div>
          <div className='workspace-sidebar-caption'>{t('home.landing.demo.workspace')}</div>
          <div className='workspace-sidebar-item'>
            <LayoutGrid />
            {t('home.landing.demo.overview')}
          </div>
          <div className='workspace-sidebar-item'>
            <ListTodo />
            {t('home.landing.demo.myTasks')}
          </div>
          <div className='workspace-sidebar-item'>
            <Users />
            {t('home.landing.demo.members')}
            <span className='workspace-sidebar-count'>{3}</span>
          </div>
          <div className='workspace-sidebar-caption'>
            {t('home.landing.demo.projects')}
            <Plus />
          </div>
          <div className='workspace-sidebar-item selected'>
            <span className='workspace-project-dot' />
            {t('home.landing.demo.project')}
          </div>
          <div className='workspace-sidebar-item'>
            <span className='workspace-project-dot muted' />
            {t('home.landing.demo.website')}
          </div>
          <div className='workspace-sidebar-bottom'>
            <span className='workspace-avatar violet'>{tasks[0].initials}</span>
            <span>
              {t('home.landing.demo.memberName')}
              <small>{t('home.landing.demo.teamMember')}</small>
            </span>
          </div>
        </aside>
        <div className='workspace-main'>
          <div className='workspace-breadcrumb'>
            <Folder />
            {t('home.landing.demo.projects')}
            <span>/</span>
            <strong>{t('home.landing.demo.project')}</strong>
          </div>
          <div className='workspace-project-header'>
            <div>
              <span className='workspace-eyebrow'>{t('home.landing.demo.projectEyebrow')}</span>
              <h2>{t('home.landing.demo.project')}</h2>
              <p>{t('home.landing.demo.projectDescription')}</p>
            </div>
            <div className='workspace-members' aria-label={t('home.landing.demo.sampleMembers')}>
              <span className='workspace-avatar violet'>{tasks[0].initials}</span>
              <span className='workspace-avatar amber'>{tasks[1].initials}</span>
              <span className='workspace-avatar blue'>{tasks[2].initials}</span>
              <span className='workspace-members-extra'>
                <Plus />
              </span>
            </div>
          </div>
          <Tabs defaultValue='board' className='workspace-tabs'>
            <div className='workspace-toolbar'>
              <TabsList className='workspace-tab-list' aria-label={t('home.landing.demo.chooseView')}>
                <TabsTrigger value='board'>
                  <LayoutGrid />
                  {t('home.landing.demo.board')}
                </TabsTrigger>
                <TabsTrigger value='timeline'>
                  <CalendarDays />
                  {t('home.landing.demo.timeline')}
                </TabsTrigger>
                <TabsTrigger value='overview'>
                  <BarChart3 />
                  {t('home.landing.demo.overview')}
                </TabsTrigger>
              </TabsList>
              <Link to='/sign-up' className='workspace-add-task'>
                <Plus />
                {t('home.landing.demo.addTask')}
              </Link>
            </div>
            <TabsContent value='board' className='workspace-tab-content'>
              <div
                className='workspace-scroll'
                tabIndex={0}
                role='region'
                aria-label={t('home.landing.demo.boardDescription')}
              >
                <div className='workspace-board'>
                  {columns.map((column) => (
                    <div className={`workspace-column ${column.className}`} key={column.className}>
                      <div className='workspace-column-heading'>
                        <column.icon />
                        <h3>{column.title}</h3>
                        <span>{column.tasks.length}</span>
                      </div>
                      {column.tasks.map((task) => (
                        <TaskCard key={task.title} task={task} />
                      ))}
                      <Link to='/sign-up' className='workspace-column-add'>
                        <Plus />
                        {t('home.landing.demo.addTask')}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value='timeline' className='workspace-tab-content'>
              <div
                className='workspace-scroll'
                tabIndex={0}
                role='region'
                aria-label={t('home.landing.demo.timelineDescription')}
              >
                <div className='workspace-timeline'>
                  <div className='workspace-timeline-head'>
                    <strong>{t('home.landing.demo.thisWeek')}</strong>
                    {weekdays.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  {tasks.slice(0, 5).map((task, index) => (
                    <div className='workspace-timeline-row' key={task.title}>
                      <span>{task.title}</span>
                      <div className='workspace-timeline-track'>
                        <div
                          className={`workspace-timeline-bar ${task.color}`}
                          style={{ left: `${index * 12}%`, width: `${52 - index * 4}%` }}
                        >
                          {task.done ? <Check /> : <span className='workspace-timeline-bar-dot' />}
                          {task.initials}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value='overview' className='workspace-tab-content'>
              <div className='workspace-overview'>
                <div className='workspace-overview-stats'>
                  {[
                    { label: t('home.landing.demo.totalTasks'), value: tasks.length, className: 'violet' },
                    { label: t('home.landing.demo.inProgress'), value: 2, className: 'amber' },
                    { label: t('home.landing.demo.done'), value: 2, className: 'mint' }
                  ].map((stat) => (
                    <div key={stat.label} className={`workspace-stat ${stat.className}`}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
                <div className='workspace-overview-progress'>
                  <div>
                    <strong>{t('home.landing.demo.projectProgress')}</strong>
                    <span>
                      {t('home.landing.demo.progressCount', {
                        completed: tasks.filter((task) => task.done).length,
                        total: tasks.length
                      })}
                    </span>
                  </div>
                  <div className='workspace-progress-track'>
                    <span />
                  </div>
                  <p>{t('home.landing.demo.progressDescription')}</p>
                </div>
                <div className='workspace-overview-activity'>
                  <CheckCircle2 />
                  <div>
                    <strong>{t('home.landing.demo.tasks.brand')}</strong>
                    <span>{t('home.landing.demo.activityDescription')}</span>
                  </div>
                  <span className='workspace-avatar blue'>{tasks[2].initials}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className='workspace-bottom-bar'>
            <span>
              <span className='workspace-status-dot' />
              {t('home.landing.demo.sample')}
            </span>
            <span className='workspace-mobile-hint'>{t('home.landing.demo.swipe')}</span>
            <span className='workspace-desktop-hint'>{t('home.landing.demo.switchHint')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
