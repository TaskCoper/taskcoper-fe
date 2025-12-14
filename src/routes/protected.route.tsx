import ProjectLayout from '@/layouts/project.layout'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const ProjectTasksPage = lazy(() => import('@/pages/project-tasks.page'))

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProjectLayout />,
    children: [
      {
        path: '/projects/:id',
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
            element: <ProjectTasksPage />
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
