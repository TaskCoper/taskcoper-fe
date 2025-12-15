import { Toaster } from '@/components/ui/sonner'
// import { protectedRoutes } from '@/routes/protected.route'
import { publicRoutes } from '@/routes/public.route'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import ReactQueryProvider from './lib/react-query'
import NotFoundPage from './pages/not-found.page'

import '@/lib/i18n/i18n'
import './index.css'

const router = createBrowserRouter([
  ...publicRoutes,
  // ...protectedRoutes,
  {
    path: '*',
    element: <NotFoundPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactQueryProvider>
      <RouterProvider router={router} />
      <Toaster position='top-right' />
    </ReactQueryProvider>
  </StrictMode>
)
