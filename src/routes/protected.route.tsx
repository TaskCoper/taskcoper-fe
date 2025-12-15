import ProjectLayout from '@/layouts/project.layout'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))
const TaskDetailDialogPage = lazy(() => import('@/pages/task-detail-dialog.page'))

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProjectLayout />,
    children: [
      {
        path: '/projects/:projectId',
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
          {
            path: 'calendar',
            element: <div>Calendar</div>
          },
          {
            path: 'chat',
            element: <div>Chat</div>
          },
          {
            path: 'note',
            element: <div>Note</div>
          },
          {
            path: 'settings',
            element: <div>Settings</div>
          }
        ]
      }
    ]
  }
]
