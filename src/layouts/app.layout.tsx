import { ConfirmDialog } from '@/components/confirm-dialog'
import ReactQueryProvider from '@/lib/react-query'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

export default function AppLayout() {
  return (
    <ReactQueryProvider>
      <Outlet />
      <Toaster position='top-right' />
      <ConfirmDialog />
    </ReactQueryProvider>
  )
}
