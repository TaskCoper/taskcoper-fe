import type { I18nKey } from '@/lib/i18n/types'
import { useTranslation } from 'react-i18next'

export function PlaceholderPage({ titleKey }: { titleKey: I18nKey }) {
  const { t } = useTranslation()

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <p className='text-2xl font-bold'>{t(titleKey)}</p>
    </div>
  )
}
