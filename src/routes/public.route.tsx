import HomePage from '@/pages/home.page'
import { type RouteObject } from 'react-router'

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  }
]
