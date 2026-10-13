import { Button } from '@/components/ui/button'

const LABEL = 'Break the world'

// Tạm thời để kiểm tra kết nối Sentry, xoá cùng dòng render trong app.layout.tsx sau khi verify xong
export function SentryTestButton() {
  return (
    <Button
      variant='destructive'
      size='sm'
      className='fixed bottom-4 left-4 z-50'
      onClick={() => {
        throw new Error('This is your first error!')
      }}
    >
      {LABEL}
    </Button>
  )
}
