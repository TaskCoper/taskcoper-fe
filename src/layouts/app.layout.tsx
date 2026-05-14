import { ConfirmDialog } from '@/components/confirm-dialog'
import BecomeMentorWidget from '@/components/mentor/become-mentor-widget'
import ReactQueryProvider from '@/lib/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

export default function AppLayout() {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <Outlet />
        <Toaster position='top-right' />
        <ConfirmDialog />
        <BecomeMentorWidget />
      </ReactQueryProvider>
    </NuqsAdapter>
  )
}
