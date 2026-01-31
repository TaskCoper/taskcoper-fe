import AuthGuardLayout from '@/layouts/auth-guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import ProjectsLayout from '@/layouts/projects.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import UserDefaultLayout from '@/layouts/user-default.layout'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const ProjectsPage = lazy(() => import('@/pages/users/projects.page'))
const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const TaskDetailDialogPage = lazy(() => import('@/pages/task-detail-dialog.page'))
const VerifyEmailPage = lazy(() => import('@/pages/users/verify-email.page'))
const ProjectInfoPage = lazy(() => import('@/pages/project-info.page'))
const ProjectStoragePage = lazy(() => import('@/pages/project-storage.page'))

export const userRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      {
        element: <RoleGuardLayout allowedRoles={['user']} />,
        children: [
          {
            path: '/verify-email',
            element: <VerifyEmailPage />
          },
          {
            element: <UserDefaultLayout />,
            children: [
              {
                element: <ProjectsLayout />,
                children: [
                  {
                    path: 'projects',
                    element: <ProjectsPage />
                  },
                  {
                    path: 'calendar',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Calendar Comming Soon</p>
                      </div>
                    )
                  }
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
                    path: 'milestones/:milestoneId',
                    element: <ProjectTasksPage />,
                    children: [
                      {
                        path: 'tasks/:taskId',
                        element: <TaskDetailDialogPage />
                      }
                    ]
                  },
                  { path: 'info', element: <ProjectInfoPage /> },
                  {
                    path: 'calendar',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Calendar Comming Soon</p>
                      </div>
                    )
                  },
                  {
                    path: 'performance',
                    element: (
                      <div className='w-full h-full flex justify-center items-center'>
                        <p className='text-2xl font-bold'>Performance Comming Soon</p>
                      </div>
                    )
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
                  { path: 'storage', element: <ProjectStoragePage /> },
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
                  <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-2xl font-bold'>Featured Projects Comming Soon</p>
                  </div>
                )
              },
              {
                path: 'network',
                element: (
                  <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-2xl font-bold'>Network Comming Soon</p>
                  </div>
                )
              },
              {
                path: 'community',
                element: (
                  <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-2xl font-bold'>Community Comming Soon</p>
                  </div>
                )
              },
              {
                path: 'news',
                element: (
                  <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-2xl font-bold'>News Comming Soon</p>
                  </div>
                )
              }
            ]
          }
        ]
      }
    ]
  }
]
