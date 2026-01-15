import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetProvinces } from '@/hooks/use-get-provinces'
import { useGetWards } from '@/hooks/use-get-wards'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUpdateMe } from '../hooks/use-update-me'
import type { UpdateMeFormValues } from '../validations'
import UpdateMeForm from './update-me-form'

export default function ProfileSection() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const { methods, updateMe, isUpdatingMe } = useUpdateMe()
  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty }
  } = methods

  const { provinces, isLoadingProvinces } = useGetProvinces()
  const cityCodeForm = watch('cityCode')
  const { wards, isLoadingWards } = useGetWards(cityCodeForm ?? -1)

  const onSubmit: SubmitHandler<UpdateMeFormValues> = (body) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cityCode, wardCode, ...rest } = body
    updateMe(
      { body: rest },
      {
        onSuccess: () => {
          reset(body, { keepValues: true })
        }
      }
    )
  }

  useEffect(() => {
    if (me) {
      const matchedProvince = provinces.find((p) => p.name === me.city)
      const cityCode = matchedProvince?.code ?? -1

      reset({
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email,
        address: me.address,
        avatar: me.avatar,
        city: me.city,
        cityCode,
        wardCode: -1,
        phoneNumber: me.phoneNumber,
        state: me.state
      })

      if (cityCode !== -1) {
        setValue('cityCode', cityCode)
      }
    }
  }, [me, reset, provinces, setValue])

  useEffect(() => {
    if (me && wards.length > 0 && cityCodeForm !== -1) {
      const matchedWard = wards.find((w) => w.name === me.state)
      if (matchedWard) {
        setValue('wardCode', matchedWard.code)
      }
    }
  }, [wards, me, cityCodeForm, setValue])

  if (isGettingMe)
    return (
      <div className='space-y-2'>
        <Skeleton className='w-full h-28' />
        <Skeleton className='w-full h-20' />
        <Skeleton className='w-full h-16' />
      </div>
    )

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='px-24 pb-6'>
          <UpdateMeForm
            provinces={provinces}
            wards={wards}
            isLoadingProvinces={isLoadingProvinces}
            isLoadingWards={isLoadingWards}
          />

          <div className='flex items-center justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => reset()} disabled={!isDirty || isUpdatingMe}>
              {t('common.button.cancel')}
            </Button>

            <Button type='submit' disabled={!isDirty || isUpdatingMe}>
              {isUpdatingMe ? <Spinner /> : null}
              {t('common.button.save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
