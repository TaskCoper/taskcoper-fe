import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetProvinces } from '@/hooks/use-get-provinces'
import { useGetWards } from '@/hooks/use-get-wards'
import { useUploadFile } from '@/hooks/use-upload-file'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateMe } from '../hooks/use-update-me'
import type { UpdateMeFormValues } from '../validations'
import UpdateMeForm from './update-me-form'

export default function ProfileSection() {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const { methods, updateMe, isUpdatingMe } = useUpdateMe()
  const { uploadFileAsync, isUploading } = useUploadFile()

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null)

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

  const handleAvatarChange = useCallback(
    (file: File | null) => {
      if (file) {
        setPendingAvatarFile(file)
        setPendingAvatarPreview(URL.createObjectURL(file))
      } else {
        if (pendingAvatarPreview) {
          URL.revokeObjectURL(pendingAvatarPreview)
        }
        setPendingAvatarFile(null)
        setPendingAvatarPreview(null)
      }
    },
    [pendingAvatarPreview]
  )

  // clean up object url on unmount
  useEffect(() => {
    return () => {
      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview)
      }
    }
  }, [pendingAvatarPreview])

  useEffect(() => {
    if (me) {
      document.title = `${me?.firstName} ${me?.lastName} | TaskCoper`
    }
  }, [me])

  const onSubmit: SubmitHandler<UpdateMeFormValues> = async (body) => {
    let avatarUrl = body.avatar

    // upload pending avatar if exists
    if (pendingAvatarFile) {
      const toastId = toast.loading(t('common.ui.uploading'), {
        description: t('common.ui.pleaseWait')
      })

      try {
        const url = await uploadFileAsync({
          file: pendingAvatarFile,
          onProgress: (progress) => {
            toast.loading(t('common.ui.uploading'), {
              id: toastId,
              description: (
                <div className='w-72 space-y-1'>
                  <Progress value={progress} className='w-full' />
                  <p className='text-xs text-muted-foreground'>{progress}%</p>
                </div>
              )
            })
          }
        })

        if (url) {
          toast.success(t('common.ui.uploadSuccess'), {
            id: toastId,
            description: null
          })
          avatarUrl = url
        }
      } catch {
        toast.error(t('error.somethingWentWrong'), { id: toastId })
        return
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cityCode, wardCode, ...rest } = body
    updateMe(
      { body: { ...rest, avatar: avatarUrl } },
      {
        onSuccess: () => {
          reset({ ...body, avatar: avatarUrl }, { keepValues: true })
          handleAvatarChange(null)
        }
      }
    )
  }

  useEffect(() => {
    if (me && provinces.length > 0) {
      const matchedProvince = provinces.find((p) => p.name === me.originalCity)
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
      const matchedWard = wards.find((w) => w.name === me.originalState)
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

  const isFormDirty = isDirty || pendingAvatarFile !== null
  const isSubmitting = isUpdatingMe || isUploading

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='px-24 pb-6'>
          <UpdateMeForm
            provinces={provinces}
            wards={wards}
            isLoadingProvinces={isLoadingProvinces}
            isLoadingWards={isLoadingWards}
            onAvatarChange={handleAvatarChange}
            pendingAvatarPreview={pendingAvatarPreview}
          />

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                reset()
                handleAvatarChange(null)
              }}
              disabled={!isFormDirty || isSubmitting}
            >
              {t('common.button.cancel')}
            </Button>

            <Button type='submit' disabled={!isFormDirty || isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              {t('common.button.save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
