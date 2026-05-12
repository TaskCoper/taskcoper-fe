import SingleSelectField from '@/components/single-select-field'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useEffect, useMemo } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetUser } from '../hooks/use-get-user'
import { useUpdateMe } from '../hooks/use-update-me'
import type { UpdateMeFormValues } from '../validations'

const NO_TIMEZONE_VALUE = '__none__'

const getTimeZoneOffsetString = (timeZone: string) => {
  const now = new Date()

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(now)
    const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0)

    const asUtcTimestamp = Date.UTC(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      getPart('hour'),
      getPart('minute'),
      getPart('second')
    )

    const offsetMinutes = Math.round((asUtcTimestamp - now.getTime()) / 60000)
    const sign = offsetMinutes >= 0 ? '+' : '-'
    const absoluteMinutes = Math.abs(offsetMinutes)
    const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0')
    const minutes = String(absoluteMinutes % 60).padStart(2, '0')

    return `${sign}${hours}:${minutes}`
  } catch {
    return '+00:00'
  }
}

export default function LocationSection() {
  const { t } = useTranslation()

  const { userIdentifier } = useParams<{ userIdentifier: string }>()
  const { user: me } = useGetUser({ userIdentifier })

  const { methods, updateMe, isUpdatingMe } = useUpdateMe()

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isDirty }
  } = methods

  const timezoneOptions = useMemo(
    () => [
      { label: t('project.memberProfile.noTimeZone'), value: NO_TIMEZONE_VALUE },
      ...Intl.supportedValuesOf('timeZone').map((timeZone) => ({
        label: `${timeZone} (${getTimeZoneOffsetString(timeZone)})`,
        value: timeZone
      }))
    ],
    [t]
  )

  useEffect(() => {
    if (!me) return

    reset({
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email,
      address: me.address,
      avatar: me.avatar,
      city: me.city,
      cityCode: -1,
      wardCode: -1,
      coverImageUrl: me.coverImageUrl,
      domainIds: me.domains.map((domain) => domain.id),
      phoneNumber: me.phoneNumber,
      state: me.state,
      timeZone: me.timeZone
    })
  }, [me, reset])

  const onSubmit: SubmitHandler<UpdateMeFormValues> = (body) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cityCode, wardCode, ...rest } = body

    updateMe(
      { body: { ...rest } },
      {
        onSuccess: () => {
          reset({ ...body }, { keepValues: true })
        }
      }
    )
  }

  return (
    <div>
      <p className='text-lg font-semibold'>{t('user.profileDialog.location')}</p>
      <p className='text-sm text-muted-foreground'>{t('user.location.description')}</p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <SingleSelectField<UpdateMeFormValues>
            name='timeZone'
            control={methods.control}
            label='user.location.field.timeZone.label'
            options={timezoneOptions}
            placeholder='user.location.field.timeZone.placeholder'
            searchPlaceholder='user.location.field.timeZone.searchPlaceholder'
            emptyMessage='user.location.field.timeZone.emptyMessage'
            onChange={(value) => {
              setValue('timeZone', value === NO_TIMEZONE_VALUE || value === '' ? null : value, {
                shouldDirty: true,
                shouldValidate: true
              })
            }}
          />

          <div className='flex items-center justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => reset()} disabled={!isDirty || isUpdatingMe}>
              {t('common.button.cancel')}
            </Button>

            <Button type='submit' disabled={!isDirty || isUpdatingMe}>
              {isUpdatingMe ? <Spinner /> : null}
              {t('user.password.saveChanges')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
