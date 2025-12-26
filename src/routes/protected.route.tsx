import DefaultLayout from '@/layouts/default.layout'
import GuardLayout from '@/layouts/guard.layout'
import ProjectDetailLayout from '@/layouts/project-detail.layout'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const ProjectsPage = lazy(() => import('@/pages/projects.page'))
const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const TaskDetailDialogPage = lazy(() => import('@/pages/task-detail-dialog.page'))
const VerifyEmailPage = lazy(() => import('@/pages/verify-email.page'))

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
            path: '/projects',
            children: [
              {
                index: true,
                element: <ProjectsPage />
              },
              {
                path: ':projectId',
                element: <ProjectDetailLayout />,
                children: [
                  {
                    index: true,
                    element: <ProjectTasksPage />
                  },
                  {
                    path: 'info',
                    element: <div>Info</div>
                  },
                  {
                    path: 'tasks',
                    element: <ProjectTasksPage />,
                    children: [
                      {
                        path: ':taskId',
                        element: <TaskDetailDialogPage />
                      }
                    ]
                  },
                  { path: 'calendar', element: <div>Calendar</div> },
                  { path: 'chat', element: <div>Chat</div> },
                  { path: 'note', element: <div>Note</div> },
                  { path: 'settings', element: <div>Settings</div> }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
