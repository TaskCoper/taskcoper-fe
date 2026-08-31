import { ConfirmDialog } from '@/components/confirm-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import ReactQueryProvider from '@/lib/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

export default function AppLayout() {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <TooltipProvider delayDuration={100}>
          <Outlet />
          <Toaster position='top-right' />
          <ConfirmDialog />
          {/* <BecomeMentorWidget /> */}
        </TooltipProvider>
      </ReactQueryProvider>
    </NuqsAdapter>
  )
}
