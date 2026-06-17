import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTenantTranslation()

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <p className='text-2xl font-bold'>{t(titleKey)}</p>
    </div>
  )
}
