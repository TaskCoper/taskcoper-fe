import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { I18nKey } from '@/lib/i18n/types'

interface PageWrapperProps {
  titleKey: I18nKey
  children: React.ReactNode
}

export default function PageWrapper({ titleKey, children }: PageWrapperProps) {
  const { t } = useTranslation()
  const title = t(titleKey)

  useEffect(() => {
    document.title = `${title} | TaskCoper`
  }, [title])

  return <>{children}</>
}
