import { ConfirmDialog } from '@/components/confirm-dialog'
import { SentryTestButton } from '@/components/sentry-test-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import SentryUserContext from '@/features/users/components/sentry-user-context'
import ReactQueryProvider from '@/lib/react-query'
import config from '@/shared/config'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

export default function AppLayout() {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <TooltipProvider delayDuration={100}>
          <SentryUserContext />
          <Outlet />
          <Toaster position='top-right' />
          <ConfirmDialog />
          {(import.meta.env.DEV || config.sentryEnvironment === 'htm-dev') && <SentryTestButton />}
          {/* <BecomeMentorWidget /> */}
        </TooltipProvider>
      </ReactQueryProvider>
    </NuqsAdapter>
  )
}
