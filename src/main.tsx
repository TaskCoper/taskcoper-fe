import { protectedRoutes } from '@/routes/protected.route'
import { publicRoutes } from '@/routes/public.route'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import AppLayout from './layouts/app.layout'
import NotFoundPage from './pages/not-found.page'

import '@/lib/i18n/i18n'
import './index.css'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
