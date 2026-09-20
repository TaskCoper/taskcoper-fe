import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { PreviewLocale } from './preview/preview-shared'

const PREVIEW_LOCALES: PreviewLocale[] = ['vi', 'en']

/** Bộ chuyển VI/EN dùng cho cả thanh preview lẫn cột form của hai trang B2B. */
export function PreviewLocaleToggle({
  value,
  onChange
}: {
  value: PreviewLocale
  onChange: (locale: PreviewLocale) => void
}) {
  const { t } = useTenantTranslation()

  return (
    <div className='flex items-center rounded-md border p-0.5'>
      {PREVIEW_LOCALES.map((option) => (
        <button
          key={option}
          type='button'
          onClick={() => onChange(option)}
          className={cn(
            'cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold uppercase transition-colors',
            option === value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(`configsPage.b2bOverviewPage.previewLocale.${option}`)}
        </button>
      ))}
    </div>
  )
}

/** Khung ba cột (nav / form / preview) của trang B2B khi danh sách config còn đang tải. */
export function B2BPageSkeleton() {
  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex items-center gap-2 border-b px-4 py-3'>
        <Skeleton className='h-8 w-64' />
      </div>
      <div className='flex flex-1 gap-4 p-4'>
        <Skeleton className='h-full w-48' />
        <Skeleton className='h-full w-[26rem]' />
        <Skeleton className='h-full flex-1' />
      </div>
    </div>
  )
}
