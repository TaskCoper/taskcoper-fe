import { Button } from '@/components/ui/button'
import { AxiosError } from 'axios'
import { AlertCircle, ArrowLeftIcon, FileQuestion, HomeIcon, ServerCrash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

export default function ErrorPage() {
  const { t } = useTranslation()
  const error = useRouteError()
  const navigate = useNavigate()

  let title = t('error.somethingWentWrong')
  let message = t('error.somethingWentWrongDescription')
  let Icon = AlertCircle
  let statusCode: string | number | null = null

  if (isRouteErrorResponse(error)) {
    statusCode = error.status
    title = error.statusText
    message = error.data?.message || t('error.pageNotFoundDescription')
    if (error.status === 404) Icon = FileQuestion
  } else if (error instanceof AxiosError) {
    statusCode = error.response?.status || 500
    title = error.response?.statusText || t('error.apiError')
    message = error.response?.data?.message || error.message

    if (statusCode === 404) {
      Icon = FileQuestion
      message = t('error.pageNotFoundDescription')
    } else if (statusCode === 401 || statusCode === 403) {
      Icon = ServerCrash
      message = t('error.apiErrorDescription')
    } else {
      Icon = ServerCrash
    }
  } else if (error instanceof Error) {
    title = t('error.genericError')
    message = error.message
    Icon = ServerCrash
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center sm:p-8'>
      <div className='absolute left-1/2 top-1/2 -z-10 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[80px] sm:h-[300px] sm:w-[300px] sm:blur-[100px]' />

      <div className='w-full max-w-md space-y-6 sm:space-y-8'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20'>
            <Icon className='h-8 w-8 text-muted-foreground sm:h-10 sm:w-10' />
          </div>
          {statusCode && (
            <span className='rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground sm:text-sm'>
              {statusCode}
            </span>
          )}
        </div>

        <div className='space-y-2 px-2 sm:px-0'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl'>{title}</h1>
          <p className='text-sm text-muted-foreground sm:text-base'>{message}</p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button variant='outline' onClick={() => navigate(-1)} className='w-full gap-2 sm:w-auto'>
            <ArrowLeftIcon />
            {t('error.back')}
          </Button>

          <Button onClick={() => navigate('/', { replace: true })} className='w-full gap-2 sm:w-auto'>
            <HomeIcon />
            {t('error.home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
