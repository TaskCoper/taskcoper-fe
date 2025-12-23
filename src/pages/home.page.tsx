import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans gap-4'>
        <div className='w-full max-w-3xl text-center'>
          <h1 className='mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl'>
            Coming Soon
          </h1>

          <p className='mx-auto mb-2 max-w-2xl text-[0.95rem] leading-relaxed text-gray-600'>
            Taskcoper nền tảng quản trị toàn diện dành cho doanh nghiêp vừa và nhỏ (SME) - giải pháp số về quản trị cho
            doanh nghiệp giáo dục triển khai mô hình Project Based Learning.
          </p>

          <p className='mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-gray-900'>
            Quản Trị · Kết Nối · Bức Tốc
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={() => navigate('/sign-in')}>
            {t('auth.signIn.label')}
          </Button>
          <Button onClick={() => navigate('/sign-up')}>{t('auth.signUp.label')}</Button>
        </div>
      </div>

      <Outlet />
    </>
  )
}
