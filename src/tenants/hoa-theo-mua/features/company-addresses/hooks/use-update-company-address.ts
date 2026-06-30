import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import companyAddressService from '../services'
import { updateCompanyAddressSchema, type UpdateCompanyAddressFormValues } from '../validations'

const defaultValues: UpdateCompanyAddressFormValues = {
  fullName: '',
  phone: '',
  remarks: '',
  addressLine: '',
  city: '',
  ward: '',
  cityCode: -1,
  latitude: 0,
  longitude: 0,
  mapId: '',
  wardCode: -1,
  country: 'Việt Nam'
}

export const useUpdateCompanyAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const schema = useMemo(() => updateCompanyAddressSchema(t), [t])

  const methods = useForm<UpdateCompanyAddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const { mutate: updateCompanyAddress, isPending: isUpdatingCompanyAddress } = useMutation({
    mutationFn: companyAddressService.updateCompanyAddress,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['company-address'] })
    }
  })

  return { methods, updateCompanyAddress, isUpdatingCompanyAddress }
}
