import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useEffect, useState } from 'react'

// Một lượt AI có ngân sách tới 180 giây. Spinner quay im lìm ba phút thì không phân biệt được
// với treo, nên hiện luôn đồng hồ đếm. Chặn thao tác thì để từng nút tự khoá.
const MarketingPostBusyBanner = ({ title, description }: { title: string; description?: string }) => {
  const { t } = useTenantTranslation()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSeconds((previous) => previous + 1), 1000)

    return () => clearInterval(timer)
  }, [])

  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div
      role='status'
      aria-live='polite'
      className='flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm'
    >
      <Spinner className='size-4 text-primary' />
      <span className='font-medium'>{title}</span>
      <span className='font-mono font-bold tabular-nums'>{elapsed}</span>
      <span className='text-xs text-muted-foreground'>
        {description ?? t('marketingPosts.studio.busy.description')}
      </span>
    </div>
  )
}

export default MarketingPostBusyBanner
