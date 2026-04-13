/* eslint-disable react-refresh/only-export-components */
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import ProjectPermissionGuardLayout from '@/layouts/project-permission-guard.layout'
import ProjectsLayout from '@/layouts/projects.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import UserDefaultLayout from '@/layouts/user-default.layout'
import { lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type RouteObject } from 'react-router'

const ProjectsPage = lazy(() => import('@/pages/users/projects.page'))
const CalendarPage = lazy(() => import('@/pages/users/calendar.page'))
const VerifyEmailPage = lazy(() => import('@/pages/users/verify-email.page'))

const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const ProjectInfoPage = lazy(() => import('@/pages/project-info.page'))
const ProjectStoragePage = lazy(() => import('@/pages/project-storage.page'))
const ProjectPerformancePage = lazy(() => import('@/pages/project-performance.page'))
const ProjectCalendarPage = lazy(() => import('@/pages/project-calendar.page'))
const TaskDialogPage = lazy(() => import('@/pages/task-dialog.page'))
const ProjectRevenuePage = lazy(() => import('@/pages/project-revenue.page'))
const ProjectSettingsPage = lazy(() => import('@/pages/project-settings.page'))
const ProjectMemberPage = lazy(() => import('@/pages/project-member.page'))
const ProjectRolePage = lazy(() => import('@/pages/project-role.page'))

const SettingsPage = lazy(() => import('@/pages/users/settings.page'))
const NetworkPage = lazy(() => import('@/pages/users/network.page'))
const ProfilePage = lazy(() => import('@/pages/users/profile.page'))

const MentorApplicationPage = lazy(() => import('@/pages/users/mentor-application.page'))
const MentorApplicationsPage = lazy(() => import('@/pages/users/mentor-applications.page'))
const SchedulesPage = lazy(() => import('@/pages/users/schedules.page'))
const CheckoutPage = lazy(() => import('@/pages/users/checkout.page'))
const TransactionsPage = lazy(() => import('@/pages/users/transactions.page'))

const MentorPackagesPage = lazy(() => import('@/pages/users/mentor-packages.page'))
const MentorPackagePage = lazy(() => import('@/pages/users/mentor-package.page'))

const PurchaseHistoryPage = lazy(() => import('@/pages/users/purchase-history.page'))
const PurchasedPackagePage = lazy(() => import('@/pages/users/purchased-package.page'))

const MentorVouchersPage = lazy(() => import('@/pages/users/mentor-vouchers.page'))
const MentorVoucherPage = lazy(() => import('@/pages/users/mentor-voucher.page'))

const MeetingDialogPage = lazy(() => import('@/pages/users/meeting-dialog.page'))

const GoogleCallbackPage = lazy(() => import('@/pages/google-callback.page'))

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
            path: 'integrations/google/callback',
            element: <GoogleCallbackPage />
          },
          {
            path: 'payments/checkout',
            element: <CheckoutPage />
          },
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
                    path: 'transactions',
                    element: (
                      <PageWrapper titleKey='pageTitle.transactions'>
                        <TransactionsPage />
                      </PageWrapper>
                    )
                  },
                  {
                    path: 'purchases',
                    element: <PurchaseHistoryPage />
                  },
                  {
                    path: 'purchases/packages/:packageId',
                    element: <PurchasedPackagePage />
                  },
                  {
                    path: 'calendar',
                    element: <CalendarPage />,
                    children: [
                      {
                        path: 'meetings/:meetingId',
                        element: <MeetingDialogPage />
                      }
                    ]
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
                    element: <RoleGuardLayout allowedRoles={['user']} allowedUserRoles={['User']} />,
                    children: [
                      {
                        path: 'applications/submit',
                        element: <MentorApplicationPage />
                      },
                      { path: 'applications', element: <MentorApplicationsPage /> }
                    ]
                  },
                  {
                    element: <RoleGuardLayout allowedRoles={['user']} allowedUserRoles={['Mentor']} />,
                    children: [
                      { path: 'packages', element: <MentorPackagesPage /> },
                      { path: 'packages/:packageId', element: <MentorPackagePage /> },
                      { path: 'vouchers', element: <MentorVouchersPage /> },
                      { path: 'vouchers/:voucherId', element: <MentorVoucherPage /> }
                    ]
                  }
                ]
              },
              {
                path: 'projects/:identifier',
                element: <ProjectDetailLayout />,
                children: [
                  {
                    index: true,
                    element: null
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='TASKS' />,
                    children: [
                      {
                        path: 'milestones',
                        element: null
                      },
                      {
                        path: 'milestones/:milestoneIdentifier',
                        element: <ProjectTasksPage />,
                        children: [
                          {
                            path: 'tasks/:taskIdentifier',
                            element: <TaskDialogPage />
                          }
                        ]
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='REVENUE' />,
                    children: [
                      {
                        path: 'revenue',
                        element: <ProjectRevenuePage />
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='OVERVIEW' />,
                    children: [
                      {
                        path: 'info',
                        element: <ProjectInfoPage />
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='CALENDAR' />,
                    children: [
                      {
                        path: 'calendar',
                        element: <ProjectCalendarPage />,
                        children: [
                          {
                            path: 'meetings/:meetingId',
                            element: <MeetingDialogPage />
                          }
                        ]
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='PERFORMANCE' />,
                    children: [
                      {
                        path: 'performance',
                        element: <ProjectPerformancePage />
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='CHAT' />,
                    children: [
                      {
                        path: 'chat',
                        element: (
                          <div className='w-full h-full flex justify-center items-center'>
                            <p className='text-2xl font-bold'>Chat Comming Soon</p>
                          </div>
                        )
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='NOTE' />,
                    children: [
                      {
                        path: 'note',
                        element: (
                          <div className='w-full h-full flex justify-center items-center'>
                            <p className='text-2xl font-bold'>Note Comming Soon</p>
                          </div>
                        )
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='STORAGE' />,
                    children: [
                      {
                        path: 'storage',
                        element: <ProjectStoragePage />,
                        children: [
                          {
                            path: ':milestoneId/tasks/:taskId',
                            element: <TaskDialogPage />
                          }
                        ]
                      }
                    ]
                  },
                  {
                    element: <ProjectPermissionGuardLayout sectionKey='SETTINGS' />,
                    children: [
                      {
                        path: 'settings',
                        element: <ProjectSettingsPage />
                      },
                      {
                        path: 'members/:memberId',
                        element: <ProjectMemberPage />
                      },
                      {
                        path: 'roles/:roleId',
                        element: <ProjectRolePage />
                      }
                    ]
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
