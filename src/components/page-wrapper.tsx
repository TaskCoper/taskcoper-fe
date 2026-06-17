import { useEffect } from 'react'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

import type { I18nKey } from '@/lib/i18n/types'

interface PageWrapperProps {
  titleKey: I18nKey
  children: React.ReactNode
}

export default function PageWrapper({ titleKey, children }: PageWrapperProps) {
  const { t } = useTenantTranslation()
  const title = t(titleKey)

  useEffect(() => {
    document.title = `${title} | TaskCoper`
  }, [title])

  return <>{children}</>
}
