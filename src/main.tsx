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

const CHUNK_RELOAD_KEY = 'taskcoper:chunk-reload'

const extractChunkErrorUrl = (error: unknown) => {
  if (!(error instanceof Error)) {
    return ''
  }

  const matchedUrl = error.message.match(/https?:\/\/\S+/)?.[0]
  return matchedUrl ?? error.message
}

const reloadOnChunkLoadError = (error: unknown) => {
  const payload =
    error instanceof Event
      ? ((error as CustomEvent<unknown> & { payload?: unknown }).payload ?? (error as CustomEvent<unknown>).detail)
      : error
  const url = extractChunkErrorUrl(payload)

  // Avoid infinite reload loops by only reloading once for the same failing chunk.
  if (url && sessionStorage.getItem(CHUNK_RELOAD_KEY) === url) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    return
  }

  if (url) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, url)
  }

  if (error instanceof Event) {
    error.preventDefault()
  }

  window.location.reload()
}

if (import.meta.env.PROD) {
  window.addEventListener('vite:preloadError', (event) => {
    reloadOnChunkLoadError(event)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason

    if (
      reason instanceof Error &&
      (reason.message.includes('Failed to fetch dynamically imported module') ||
        reason.message.includes('Importing a module script failed'))
    ) {
      reloadOnChunkLoadError(reason)
    }
  })
}

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
