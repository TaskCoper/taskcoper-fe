import { LoaderIcon } from 'lucide-react'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

import { cn } from '@/shared/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  const { t } = useTenantTranslation()
  return (
    <LoaderIcon
      role='status'
      aria-label={t('common.ui.loading')}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
