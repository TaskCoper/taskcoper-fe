/* eslint-disable react-refresh/only-export-components */
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import ProjectsLayout from '@/layouts/projects.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import UserDefaultLayout from '@/layouts/user-default.layout'
import { lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type RouteObject } from 'react-router'

const ProjectsPage = lazy(() => import('@/pages/users/projects.page'))
const CalendarPage = lazy(() => import('@/pages/users/calendar.page'))
const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const TaskDetailDialogPage = lazy(() => import('@/pages/task-detail-dialog.page'))
const VerifyEmailPage = lazy(() => import('@/pages/users/verify-email.page'))
const ProjectInfoPage = lazy(() => import('@/pages/project-info.page'))
const ProjectStoragePage = lazy(() => import('@/pages/project-storage.page'))
const ProjectPerformancePage = lazy(() => import('@/pages/project-performance.page'))
const ProjectCalendarPage = lazy(() => import('@/pages/project-calendar.page'))
const SettingsPage = lazy(() => import('@/pages/users/settings.page'))
const NetworkPage = lazy(() => import('@/pages/users/network.page'))
const ProfilePage = lazy(() => import('@/pages/users/profile.page'))
const MentorApplicationPage = lazy(() => import('@/pages/users/mentor-application.page'))
const MentorApplicationsPage = lazy(() => import('@/pages/users/mentor-applications.page'))
const SchedulesPage = lazy(() => import('@/pages/users/schedules.page'))
const ProjectRevenuePage = lazy(() => import('@/pages/project-revenue.page'))

const PageWrapper = ({ titleKey, children }: { titleKey: string; children: React.ReactNode }) => {
  const { t } = useTranslation()
  const title = t(titleKey)

  useEffect(() => {
    document.title = `${title} | TaskCoper`
  }, [title])

  return <>{children}</>
}

export const userRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      // NOTE: Allow admins to access verify email page (RARE)
      {
        path: '/verify-email',
        element: <VerifyEmailPage />
      },
      {
        element: <RoleGuardLayout allowedRoles={['user']} />,
        children: [
          {
            element: <UserDefaultLayout />,
            children: [
              {
                path: 'users/:userId',
                element: <ProfilePage />
              },
              {
                path: 'users/:userId/settings',
                element: <SettingsPage />
              },
              {
                element: <ProjectsLayout />,
                children: [
                  {
                    path: 'projects',
                    element: (
                      <PageWrapper titleKey='pageTitle.projects'>
                        <ProjectsPage />
                      </PageWrapper>
                    )
                  },
                  {
                    path: 'calendar',
                    element: <CalendarPage />
                  },
                  {
                    element: <RoleGuardLayout allowedRoles={['user']} allowedUserRoles={['Mentor']} />,
                    children: [
                      {
                        path: 'calendar/schedules',
                        element: <SchedulesPage />
                      }
                    ]
                  },
                  {
                    element: (
                      <PageWrapper titleKey='pageTitle.calendar'>
                        <div className='w-full h-full flex justify-center items-center'>
                          <p className='text-2xl font-bold'>Calendar Comming Soon</p>
                        </div>
                      </PageWrapper>
                    )
                  },
                  {
                    path: 'applications/submit',
                    element: <MentorApplicationPage />
                  },
                  { path: 'applications', element: <MentorApplicationsPage /> }
                ]
              },
              {
                path: 'projects/:projectId',
                element: <ProjectDetailLayout />,
                children: [
                  {
                    index: true,
                    element: null
                  },
                  {
                    path: 'milestones',
                    element: null
                  },
                  {
                    path: 'revenue',
                    element: <ProjectRevenuePage />
                  },
                  {
                    path: 'milestones/:milestoneId',
                    element: <ProjectTasksPage />,
                    children: [
                      {
                        path: 'tasks/:taskId',
                        element: <TaskDetailDialogPage />
                      }
                    ]
                  },
                  {
                    path: 'info',
                    element: <ProjectInfoPage />
                  },
                  {
                    path: 'calendar',
                    element: <ProjectCalendarPage />
                  },
                  {
                    path: 'performance',
                    element: <ProjectPerformancePage />
                  },
                  {
                    path: 'chat',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Chat Comming Soon</p>
                      </div>
                    )
                  },
                  {
                    path: 'note',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Note Comming Soon</p>
                      </div>
                    )
                  },
                  {
                    path: 'storage',
                    element: <ProjectStoragePage />,
                    children: [
                      {
                        path: ':milestoneId/tasks/:taskId',
                        element: <TaskDetailDialogPage />
                      }
                    ]
                  },
                  {
                    path: 'settings',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Settings Comming Soon</p>
                      </div>
                    )
                  }
                ]
              },
              {
                path: 'featured-projects',
                element: (
                  <PageWrapper titleKey='pageTitle.featuredProjects'>
                    <div className='w-full h-full flex justify-center items-center'>
                      <p className='text-2xl font-bold'>Featured Projects Comming Soon</p>
                    </div>
                  </PageWrapper>
                )
              },
              {
                path: 'network',
                element: (
                  <PageWrapper titleKey='pageTitle.network'>
                    <NetworkPage />
                  </PageWrapper>
                  // <PageWrapper titleKey='pageTitle.network'>
                  //   <div className='w-full h-full flex justify-center items-center'>
                  //     <p className='text-2xl font-bold'>Network Comming Soon</p>
                  //   </div>
                  // </PageWrapper>
                )
              },
              {
                path: 'community',
                element: (
                  <PageWrapper titleKey='pageTitle.community'>
                    <div className='w-full h-full flex justify-center items-center'>
                      <p className='text-2xl font-bold'>Community Comming Soon</p>
                    </div>
                  </PageWrapper>
                )
              },
              {
                path: 'news',
                element: (
                  <PageWrapper titleKey='pageTitle.news'>
                    <div className='w-full h-full flex justify-center items-center'>
                      <p className='text-2xl font-bold'>News Comming Soon</p>
                    </div>
                  </PageWrapper>
                )
              }
            ]
          }
        ]
      }
    ]
  }
]
