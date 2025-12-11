import { Toaster } from '@/components/ui/sonner'
import { protectedRoutes } from '@/routes/protected.route'
import { publicRoutes } from '@/routes/public.route'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

import '@/lib/i18n/i18n'
import './index.css'
import ReactQueryProvider from './lib/react-query'

const router = createBrowserRouter([...publicRoutes, ...protectedRoutes])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactQueryProvider>
      <RouterProvider router={router} />
      <Toaster position='top-right' />
    </ReactQueryProvider>
  </StrictMode>
)
