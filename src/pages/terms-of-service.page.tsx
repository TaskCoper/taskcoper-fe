import PageWrapper from '@/components/page-wrapper'
import { Separator } from '@/components/ui/separator'
import { BookOpen, ShieldCheck, UserCheck, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import logo from '/images/taskcoper.png'

export default function TermsOfServicePage() {
  const { t } = useTranslation()

  const sections = [
    { key: 'accounts', icon: UserCheck },
    { key: 'management', icon: Zap },
    { key: 'mentoring', icon: BookOpen },
    { key: 'payments', icon: ShieldCheck },
    { key: 'ip', icon: ShieldCheck }
  ]

  return (
    <PageWrapper titleKey='pageTitle.termsOfService'>
      <div className='min-h-screen bg-white flex flex-col'>
        {/* Modern Glassmorphism Header */}
        <header className='h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-50'>
          <div className='max-w-4xl mx-auto w-full flex items-center justify-between'>
            <Link to='/' className='flex items-center gap-2 group transition-opacity hover:opacity-80'>
              <img src={logo} alt={t('common.alt.logo')} className='h-7 w-auto object-contain' />
            </Link>
          </div>
        </header>

        {/* Compact Main Content */}
        <main className='flex-1 py-16 px-4 sm:px-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='mb-12'>
              <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4'>
                {t('purchaseHistory.legal.terms.lastUpdated')}
              </div>
              <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-slate-900'>
                {t('purchaseHistory.legal.terms.title')}
              </h1>
              <p className='mt-4 text-base text-muted-foreground leading-relaxed'>
                {t('purchaseHistory.legal.terms.intro')}
              </p>
            </div>

            <div className='space-y-12'>
              {sections.map(({ key, icon: Icon }) => (
                <section key={key} className='group'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                      <Icon className='size-5' />
                    </div>
                    <h2 className='text-lg font-semibold text-slate-800'>
                      {t(`purchaseHistory.legal.terms.sections.${key}.title`)}
                    </h2>
                  </div>
                  <div className='pl-12'>
                    <p className='text-sm sm:text-base text-slate-600 leading-relaxed'>
                      {t(`purchaseHistory.legal.terms.sections.${key}.content`)}
                    </p>
                  </div>
                </section>
              ))}
            </div>

            <Separator className='my-16 bg-slate-100' />

            <footer className='text-center text-sm text-muted-foreground pb-12'>
              <p>{t('common.copyright.allRightsReserved', { year: new Date().getFullYear() })}</p>
              <div className='flex justify-center gap-4 mt-4'>
                <Link to='/privacy-policy' className='hover:text-primary transition-colors'>
                  {t('purchaseHistory.legal.privacy.title')}
                </Link>
                <span>•</span>
                <Link to='/' className='hover:text-primary transition-colors'>
                  {t('header.home')}
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </PageWrapper>
  )
}
