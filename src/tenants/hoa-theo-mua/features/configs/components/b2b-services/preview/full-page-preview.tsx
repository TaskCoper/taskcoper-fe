import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { type B2BOverview } from '../../../types'
import { B2B_SECTION_KEYS, renderB2BSection } from './b2b-page-sections'
import { B2BPreviewFrame } from './b2b-preview-frame'
import type { PreviewContact, PreviewLocale, ServiceCardData } from './preview-shared'

const LOCALES: PreviewLocale[] = ['vi', 'en']

// Fullscreen overlay rendering the whole /b2b page in the public section order.
export function FullPagePreview({
  overview,
  cards,
  contact,
  locale,
  onLocaleChange,
  onClose
}: {
  overview: B2BOverview
  cards: Record<string, ServiceCardData>
  contact: PreviewContact
  locale: PreviewLocale
  onLocaleChange: (locale: PreviewLocale) => void
  onClose: () => void
}) {
  const { t } = useTenantTranslation()

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

      <B2BPreviewFrame className='min-h-full'>
        {B2B_SECTION_KEYS.map((key) => (
          <div key={key}>{renderB2BSection(key, { overview, cards, contact, locale })}</div>
        ))}
      </B2BPreviewFrame>
    </div>,
    document.body
  )
}
