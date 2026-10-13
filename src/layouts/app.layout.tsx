import { ConfirmDialog } from '@/components/confirm-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import SentryUserContext from '@/features/users/components/sentry-user-context'
import ReactQueryProvider from '@/lib/react-query'
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
          {/* <BecomeMentorWidget /> */}
        </TooltipProvider>
      </ReactQueryProvider>
    </NuqsAdapter>
  )
}
