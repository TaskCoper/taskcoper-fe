import { publicRoutes } from '@/routes/public.route'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import AppLayout from './layouts/app.layout'
import ErrorPage from './pages/error.page'
import { orgAdminRoutes } from './routes/org-admin.route'
import { adminRoutes } from './routes/super-admin.route'
import { userRoutes } from './routes/user.route'

import '@/lib/i18n/i18n'
import './index.css'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [...publicRoutes, ...userRoutes, ...orgAdminRoutes, ...adminRoutes]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
