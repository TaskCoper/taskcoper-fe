import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface PageWrapperProps {
  titleKey: string
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
