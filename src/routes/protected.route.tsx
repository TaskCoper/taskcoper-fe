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
                element: <div>Calendar</div>
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
              { path: 'calendar', element: <div>Project Specific Calendar</div> },
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
