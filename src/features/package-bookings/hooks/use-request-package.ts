import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import packageBookingService from '../services'
import { requestPackageSchema, type RequestPackageFormValues } from '../validations'

export const useRequestPackage = () => {
  const { t } = useTranslation()

  const methods = useForm<RequestPackageFormValues>({
    defaultValues: {
      mentorPackageId: '',
      bookedByProjectId: null,
      problemStatement: ''
    },
    resolver: zodResolver(requestPackageSchema(t))
  })

  const { mutate: requestPackage, isPending: isRequestingPackage } = useMutation({
    mutationFn: packageBookingService.requestPackage,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {}
  })

  return { methods, requestPackage, isRequestingPackage }
}
