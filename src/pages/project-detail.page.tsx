import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export default function ProjectDetailPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className='p-4 space-y-2'>
      <p>{t('projectDetail.title')}</p>

      <div className='space-x-2'>
        <Button variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>
          English
        </Button>
        <Button variant={i18n.language === 'vi' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('vi')}>
          Tiếng Việt
        </Button>
      </div>
    </div>
  )
}
