/* eslint-disable react-refresh/only-export-components */
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import ProjectPermissionGuardLayout from '@/layouts/project-permission-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import UserDefaultLayout from '@/layouts/user-default.layout'
import UserWorkspaceLayout from '@/layouts/user-workspace.layout'
import { FeatureFlagGuardLayout, TenantLandingRedirect } from '@/lib/feature-flags'
import type { I18nKey } from '@/lib/i18n/types'
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

// const SettingsPage = lazy(() => import('@/pages/users/settings.page'))
const SettingsPage = lazy(() => import('@/pages/users/settingsv2.page'))
const NetworkPage = lazy(() => import('@/pages/users/network.page'))
const NewsPage = lazy(() => import('@/pages/users/news.page'))
const ProfilePage = lazy(() => import('@/pages/users/profile.page'))

const MentorApplicationPage = lazy(() => import('@/pages/users/mentor-application.page'))
const MentorApplicationsPage = lazy(() => import('@/pages/users/mentor-applications.page'))
const SchedulesPage = lazy(() => import('@/pages/users/schedules.page'))
const CheckoutPage = lazy(() => import('@/pages/users/checkout.page'))
const TransactionsPage = lazy(() => import('@/pages/users/transactions.page'))

const MentorPackagesDashboardPage = lazy(() => import('@/pages/users/mentor-packages-dashboard.page'))
const MentorPackagesPage = lazy(() => import('@/pages/users/mentor-packages.page'))
const MentorPackagePage = lazy(() => import('@/pages/users/mentor-package.page'))
const MentorPackageBookPage = lazy(() => import('@/pages/users/mentor-package-book.page'))

const PurchaseHistoryPage = lazy(() => import('@/pages/users/purchase-history.page'))
const PurchasedPackagePage = lazy(() => import('@/pages/users/purchased-package.page'))
const PackageFeedbackPage = lazy(() => import('@/pages/users/package-feedback.page'))
const PackageRequestsPage = lazy(() => import('@/pages/users/package-requests.page'))
const PackageRequestPage = lazy(() => import('@/pages/users/package-request.page'))

const MentorVouchersPage = lazy(() => import('@/pages/users/mentor-vouchers.page'))
const MentorVoucherPage = lazy(() => import('@/pages/users/mentor-voucher.page'))

const MeetingDialogPage = lazy(() => import('@/pages/users/meeting-dialog.page'))

const GoogleCallbackPage = lazy(() => import('@/pages/google-callback.page'))

const PageWrapper = ({ titleKey, children }: { titleKey: I18nKey; children: React.ReactNode }) => {
  const { t } = useTranslation()
  const title = t(titleKey)

  useEffect(() => {
    document.title = `${title} | TaskCoper`
  }, [title])

  return <>{children}</>
}

const ComingSoonView = ({ titleKey }: { titleKey: I18nKey }) => {
  const { t } = useTranslation()

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <p className='text-2xl font-bold'>{t(titleKey)}</p>
    </div>
  )
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
            element: <FeatureFlagGuardLayout requires='module.mentorNetworking' />,
            children: [
              {
                path: 'payments/checkout',
                element: <CheckoutPage />
              }
            ]
          },

          {
            element: <UserDefaultLayout />,
            children: [
              {
                element: <FeatureFlagGuardLayout requires='module.mentorNetworking' />,
                children: [
                  {
                    path: 'purchases/:packageId/feedback',
                    element: <PackageFeedbackPage />
                  }
                ]
              },
              {
                path: 'users/:userIdentifier',
                element: <ProfilePage />
              },
              {
                path: 'users/:userIdentifier/settings',
                element: <SettingsPage />
              },
              {
                element: <UserWorkspaceLayout />,
                children: [
                  {
                    element: <FeatureFlagGuardLayout requires='module.taskManagement' />,
                    children: [
                      {
                        path: 'projects',
                        element: (
                          <PageWrapper titleKey='pageTitle.projects'>
                            <ProjectsPage />
                          </PageWrapper>
                        )
                      }
                    ]
                  },
                  {
                    element: <FeatureFlagGuardLayout requires='module.mentorNetworking' />,
                    children: [
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
                        path: 'purchases/:packageId',
                        element: <PurchasedPackagePage />,
                        children: [
                          {
                            path: 'meetings/:meetingId',
                            element: <MeetingDialogPage />
                          }
                        ]
                      },
                      {
                        element: <RoleGuardLayout allowedRoles={['user']} allowedUserRoles={['User']} />,
                        children: [
                          {
                            path: 'applications/submit',
                            element: <MentorApplicationPage />
                          },
                          { path: 'applications', element: <MentorApplicationsPage /> },
                          { path: 'requests/:requestId', element: <PackageRequestPage /> }
                        ]
                      },
                      {
                        element: <RoleGuardLayout allowedRoles={['user']} allowedUserRoles={['Mentor']} />,
                        children: [
                          { path: 'packages', element: <MentorPackagesPage /> },
                          { path: 'packages/:packageId', element: <MentorPackagePage /> },
                          { path: 'packages/dashboard', element: <MentorPackagesDashboardPage /> },
                          { path: 'vouchers', element: <MentorVouchersPage /> },
                          { path: 'vouchers/:voucherId', element: <MentorVoucherPage /> },
                          { path: 'requests', element: <PackageRequestsPage /> }
                        ]
                      }
                    ]
                  },
                  {
                    element: <FeatureFlagGuardLayout requires='module.meetings' />,
                    children: [
                      {
                        path: 'calendar',
                        element: <CalendarPage />,
                        children: [
                          {
                            path: ':meetingId',
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
                      }
                    ]
                  },
                  {
                    element: (
                      <PageWrapper titleKey='pageTitle.calendar'>
                        <ComingSoonView titleKey='pageTitle.calendarComingSoon' />
                      </PageWrapper>
                    )
                  }
                ]
              },
              {
                element: <FeatureFlagGuardLayout requires='module.mentorNetworking' />,
                children: [{ path: 'packages/:packageId/book', element: <MentorPackageBookPage /> }]
              },
              {
                element: <FeatureFlagGuardLayout requires='module.taskManagement' />,
                children: [
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
                        handle: { sidebarItem: 'milestones' },
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
                        handle: { sidebarItem: 'revenue' },
                        children: [
                          {
                            path: 'revenue',
                            element: <ProjectRevenuePage />
                          }
                        ]
                      },
                      {
                        element: <ProjectPermissionGuardLayout sectionKey='OVERVIEW' />,
                        handle: { sidebarItem: 'info' },
                        children: [
                          {
                            path: 'info',
                            element: <ProjectInfoPage />
                          }
                        ]
                      },
                      {
                        element: <ProjectPermissionGuardLayout sectionKey='CALENDAR' />,
                        handle: { sidebarItem: 'calendar' },
                        children: [
                          {
                            path: 'calendar',
                            element: <ProjectCalendarPage />,
                            children: [
                              {
                                path: ':meetingId',
                                element: <MeetingDialogPage />
                              }
                            ]
                          }
                        ]
                      },
                      {
                        element: <ProjectPermissionGuardLayout sectionKey='PERFORMANCE' />,
                        handle: { sidebarItem: 'performance' },
                        children: [
                          {
                            path: 'performance',
                            element: <ProjectPerformancePage />
                          }
                        ]
                      },
                      // {
                      //   element: <ProjectPermissionGuardLayout sectionKey='CHAT' />,
                      //   handle: { sidebarItem: 'chat' },
                      //   children: [
                      //     {
                      //       path: 'chat',
                      //       element: (
                      //         <div className='w-full h-full flex justify-center items-center'>
                      //           <p className='text-2xl font-bold'>Chat Comming Soon</p>
                      //         </div>
                      //       )
                      //     }
                      //   ]
                      // },
                      // {
                      //   element: <ProjectPermissionGuardLayout sectionKey='NOTE' />,
                      //   handle: { sidebarItem: 'note' },
                      //   children: [
                      //     {
                      //       path: 'note',
                      //       element: (
                      //         <div className='w-full h-full flex justify-center items-center'>
                      //           <p className='text-2xl font-bold'>Note Comming Soon</p>
                      //         </div>
                      //       )
                      //     }
                      //   ]
                      // },
                      {
                        element: <ProjectPermissionGuardLayout sectionKey='STORAGE' />,
                        handle: { sidebarItem: 'storage' },
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
                        handle: { sidebarItem: 'settings' },
                        children: [
                          {
                            path: 'settings',
                            element: <ProjectSettingsPage />
                          },
                          {
                            path: 'members/:memberIdentifier',
                            element: <ProjectMemberPage />
                          },
                          {
                            path: 'roles/:roleId',
                            element: <ProjectRolePage />
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              // {
              //   path: 'featured-projects',
              //   element: (
              //     <PageWrapper titleKey='pageTitle.featuredProjects'>
              //       <div className='w-full h-full flex justify-center items-center'>
              //         <p className='text-2xl font-bold'>Featured Projects Comming Soon</p>
              //       </div>
              //     </PageWrapper>
              //   )
              // },
              {
                element: <FeatureFlagGuardLayout requires='module.mentorNetworking' />,
                children: [
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
                  }
                ]
              },
              // {
              //   path: 'community',
              //   element: (
              //     <PageWrapper titleKey='pageTitle.community'>
              //       <div className='w-full h-full flex justify-center items-center'>
              //         <p className='text-2xl font-bold'>Community Comming Soon</p>
              //       </div>
              //     </PageWrapper>
              //   )
              // },
              {
                element: <FeatureFlagGuardLayout requires='module.news' />,
                children: [
                  {
                    path: 'news',
                    element: (
                      <PageWrapper titleKey='pageTitle.news'>
                        <NewsPage />
                      </PageWrapper>
                    )
                  }
                ]
              }
            ]
          },
          {
            path: '*',
            element: <TenantLandingRedirect />
          }
        ]
      }
    ]
  }
]
