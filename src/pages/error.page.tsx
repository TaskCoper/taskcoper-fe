import { Button } from '@/components/ui/button'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

export default function ErrorPage() {
  const { t } = useTranslation()
  const error = useRouteError()
  const navigate = useNavigate()

  let title = t('error.maintenance')
  let message = t('error.maintenanceDescription')
  let statusCode: string | number = 'Oops!'

  if (isRouteErrorResponse(error)) {
    statusCode = error.status
    if (error.status === 404) {
      title = t('error.pageNotFound')
      message = t('error.pageNotFoundDescription')
    } else {
      title = t('error.maintenance')
      message = t('error.maintenanceDescription')
    }
  } else if (error instanceof AxiosError) {
    statusCode = error.response?.status || 500

    if (statusCode === 404) {
      title = t('error.pageNotFound')
      message = t('error.pageNotFoundDescription')
    } else if (statusCode === 401) {
      title = t('error.unauthorized')
      message = t('error.unauthorizedDescription')
    } else if (statusCode === 403) {
      title = t('error.forbidden')
      message = t('error.forbiddenDescription')
    } else if (statusCode >= 500) {
      title = t('error.serverError')
      message = t('error.serverErrorDescription')
    } else {
      title = t('error.maintenance')
      message = t('error.maintenanceDescription')
    }
  } else if (error instanceof Error) {
    title = t('error.maintenance')
    message = t('error.maintenanceDescription')
  }

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-dot relative p-4'>
      <div className='flex aspect-square min-h-[560px] bg-radial from-background/90 via-background/40 to-background/10 flex-col items-center justify-center gap-8 rounded-full p-6 text-center sm:px-12 sm:py-20'>
        <p className='text-6xl font-bold text-primary sm:text-8xl'>{statusCode}</p>

        <div className='flex flex-col items-center gap-2'>
          <p className='text-xl font-semibold sm:text-3xl'>{title}</p>
          <p className='text-xs font-medium text-foreground/60 sm:text-base'>{message}</p>
        </div>

        <Button onClick={() => navigate('/', { replace: true })} className='w-full sm:w-auto'>
          {t('error.home')}
        </Button>
      </div>
    </div>
  )
}
