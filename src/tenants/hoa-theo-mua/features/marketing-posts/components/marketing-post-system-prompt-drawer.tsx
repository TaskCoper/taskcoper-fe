import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { SparklesIcon } from 'lucide-react'
import { marketingPostChannelPresets } from '../channel-presets'
import MarketingPostMarkdown from './marketing-post-markdown'
import type { MarketingPostChannel } from '../types'

// System prompt dài vài đoạn nên chỗ nào cần đọc kỹ thì mở drawer, còn trong thẻ nền tảng
// chỉ hiện vài dòng đầu cho biết nó đang dặn AI cái gì.
const MarketingPostSystemPromptDrawer = ({ channel }: { channel: MarketingPostChannel }) => {
  const { t } = useTenantTranslation()
  const channelLabel = t(`marketingPosts.channel.${channel}`)

  return (
    <Drawer direction='right'>
      <DrawerTrigger asChild>
        <Button type='button' variant='outline' size='sm'>
          <SparklesIcon />
          {t('marketingPosts.create.channel.systemPrompt')}
        </Button>
      </DrawerTrigger>

      <DrawerContent className='data-[vaul-drawer-direction=right]:sm:max-w-xl'>
        <DrawerHeader>
          <DrawerTitle>{t('marketingPosts.create.channel.systemPromptTitle', { channel: channelLabel })}</DrawerTitle>
          <DrawerDescription>{t('marketingPosts.create.channel.systemPromptHint')}</DrawerDescription>
        </DrawerHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4'>
          <MarketingPostMarkdown source={t(marketingPostChannelPresets[channel].promptKey)} />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button type='button' variant='outline'>
              {t('common.button.close')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default MarketingPostSystemPromptDrawer
