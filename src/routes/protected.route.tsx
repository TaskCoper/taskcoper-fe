import DefaultLayout from '@/layouts/default.layout'
import GuardLayout from '@/layouts/guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import ProjectsLayout from '@/layouts/projects.layout'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const ProjectsPage = lazy(() => import('@/pages/projects.page'))
const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const TaskDetailDialogPage = lazy(() => import('@/pages/task-detail-dialog.page'))
const VerifyEmailPage = lazy(() => import('@/pages/verify-email.page'))
const ProjectInfoPage = lazy(() => import('@/pages/project-info.page'))

export const protectedRoutes: RouteObject[] = [
  {
    element: <GuardLayout requiresAuth={true} />,
    children: [
      {
        path: '/verify-email',
        element: <VerifyEmailPage />
      },
      {
        element: <DefaultLayout />,
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
