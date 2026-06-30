import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import companyAddressService from '../services'
import { createCompanyAddressSchema, type CreateCompanyAddressFormValues } from '../validations'

const defaultValues: CreateCompanyAddressFormValues = {
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

export const useCreateCompanyAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const schema = useMemo(() => createCompanyAddressSchema(t), [t])

  const methods = useForm<CreateCompanyAddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const { mutate: createCompanyAddress, isPending: isCreatingCompanyAddress } = useMutation({
    mutationFn: companyAddressService.createCompanyAddress,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['company-address'] })
    }
  })

  return { methods, createCompanyAddress, isCreatingCompanyAddress }
}
