import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { RefreshCwIcon } from 'lucide-react'
import { marketingStudioImageTweaks, type MarketingStudioImageTweak } from '../types'
import MarketingStudioTweakPopover from './marketing-studio-tweak-popover'

// Bảo AI cắt lại một ô ảnh. Cùng kiểu với viết lại caption: nói rõ muốn khác chỗ nào
// rồi mới chạy, chứ cắt mù thì bấm mãi cũng chỉ ra bản ngẫu nhiên khác.
const MarketingStudioImageRegenerate = ({
  imageName,
  ratio,
  isBusy,
  sources,
  onRegenerate
}: {
  imageName: string
  ratio: string
  isBusy: boolean
  sources: { value: string; label: string }[]
  onRegenerate: (request: { tweaks: MarketingStudioImageTweak[]; note: string; source: string | null }) => void
}) => {
  const { t } = useTenantTranslation()

  return (
    <MarketingStudioTweakPopover
      trigger={
        <Button
          type='button'
          variant='secondary'
          size='icon'
          disabled={isBusy}
          aria-label={t('marketingPosts.studio.pool.regenerate', { name: imageName, ratio })}
          className='absolute top-1.5 right-1.5 size-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100'
        >
          <RefreshCwIcon className='size-3' />
        </Button>
      }
      // Pool ảnh nằm sát mép trái, mở xuống là đè lên sidebar nên đẩy sang phải
      side='right'
      align='start'
      title={t('marketingPosts.studio.imageRegenerate.title')}
      description={t('marketingPosts.studio.imageRegenerate.description')}
      notePlaceholder={t('marketingPosts.studio.imageRegenerate.notePlaceholder')}
      sourceLabel={t('marketingPosts.studio.imageRegenerate.sourceLabel')}
      fromScratchLabel={t('marketingPosts.studio.imageRegenerate.fromScratch')}
      sources={sources}
      submitLabel={t('marketingPosts.studio.imageRegenerate.submit')}
      options={marketingStudioImageTweaks.map((tweak) => ({
        value: tweak,
        label: t(`marketingPosts.studio.imageRegenerate.tweak.${tweak}`)
      }))}
      onSubmit={onRegenerate}
    />
  )
}

export default MarketingStudioImageRegenerate
