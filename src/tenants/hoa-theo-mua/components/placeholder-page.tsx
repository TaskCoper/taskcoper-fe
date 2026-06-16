import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'

type HoaTheoMuaKey = ParseKeys<'hoaTheoMua'>

export function PlaceholderPage({ titleKey }: { titleKey: HoaTheoMuaKey }) {
  const { t } = useTranslation('hoaTheoMua')

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <p className='text-2xl font-bold'>{t(titleKey)}</p>
    </div>
  )
}
