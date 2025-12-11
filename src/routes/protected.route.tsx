import ProjectDetailPage from '@/pages/project-detail.page'
import { type RouteObject } from 'react-router'

export const protectedRoutes: RouteObject[] = [
  {
    path: '/project/:id',
    element: <ProjectDetailPage />
  }
]
