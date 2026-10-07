import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SparklesIcon } from 'lucide-react'
import { marketingStudioTweaks, type MarketingStudioTweak } from '../types'
import MarketingStudioTweakPopover from './marketing-studio-tweak-popover'

// Bảo AI viết lại caption của riêng một kênh
const MarketingStudioRegenerate = ({
  isBusy,
  sources,
  onRegenerate
}: {
  isBusy: boolean
  sources: { value: string; label: string }[]
  onRegenerate: (options: { tweaks: MarketingStudioTweak[]; note: string; source: string | null }) => void
}) => {
  const { t } = useTenantTranslation()

  return (
    <MarketingStudioTweakPopover
      trigger={
        <Button type='button' variant='outline' size='sm' disabled={isBusy}>
          <SparklesIcon />
          {t('marketingPosts.studio.regenerate.trigger')}
        </Button>
      }
      title={t('marketingPosts.studio.regenerate.title')}
      description={t('marketingPosts.studio.regenerate.description')}
      notePlaceholder={t('marketingPosts.studio.regenerate.notePlaceholder')}
      sourceLabel={t('marketingPosts.studio.regenerate.sourceLabel')}
      fromScratchLabel={t('marketingPosts.studio.regenerate.fromScratch')}
      sources={sources}
      submitLabel={t('marketingPosts.studio.regenerate.submit')}
      options={marketingStudioTweaks.map((tweak) => ({
        value: tweak,
        label: t(`marketingPosts.studio.regenerate.tweak.${tweak}`)
      }))}
      onSubmit={onRegenerate}
    />
  )
}

export default MarketingStudioRegenerate
