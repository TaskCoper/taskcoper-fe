import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { B2BPreviewFrame } from '../preview/b2b-preview-frame'
import { CtaPreview } from '../preview/cta-preview'
import { ServiceBreadcrumbPreview, ServiceHeroPreview, ServiceSidebarPreview } from './service-chrome'
import { getServiceSectionKeys, renderServiceSection } from './service-sections'
import type { ServicePreviewData } from './service-preview-scroll-pane'
import type { PreviewLocale } from './service-preview-shared'

const LOCALES: PreviewLocale[] = ['vi', 'en']

// Fullscreen overlay rendering the whole /b2b/[service] page in the public section order.
export function ServiceFullPagePreview({
  data,
  onLocaleChange,
  onClose
}: {
  data: ServicePreviewData
  onLocaleChange: (locale: PreviewLocale) => void
  onClose: () => void
}) {
  const { t } = useTenantTranslation()
  const { detail, siblings, contact, cta, locale, zaloUrl } = data
  const sectionKeys = getServiceSectionKeys(detail)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='fixed top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-black/40 p-1 backdrop-blur'>
        {LOCALES.map((option) => (
          <button
            key={option}
            type='button'
            onClick={() => onLocaleChange(option)}
            className={cn(
              'cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors',
              option === locale ? 'bg-white text-black' : 'text-white/80 hover:text-white'
            )}
          >
            {t(`configsPage.b2bOverviewPage.previewLocale.${option}`)}
          </button>
        ))}
        <button
          type='button'
          onClick={onClose}
          aria-label={t('configsPage.b2bOverviewPage.closePreview')}
          className='grid size-7 cursor-pointer place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white'
        >
          <X className='size-4' />
        </button>
      </div>

      <B2BPreviewFrame className='min-h-full pb-4'>
        <ServiceBreadcrumbPreview detail={detail} locale={locale} />
        <ServiceHeroPreview detail={detail} locale={locale} />
        <div className='mx-auto mt-8 grid w-full max-w-7xl gap-8 px-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_21rem]'>
          <main className='min-w-0 space-y-8'>
            {sectionKeys.map((key) => (
              <div key={key} className='scroll-mt-28'>
                {renderServiceSection(key, detail, locale, zaloUrl)}
              </div>
            ))}
          </main>
          <ServiceSidebarPreview sectionKeys={sectionKeys} siblings={siblings} contact={contact} locale={locale} />
        </div>
        <CtaPreview cta={cta} contact={contact} locale={locale} />
      </B2BPreviewFrame>
    </div>,
    document.body
  )
}
