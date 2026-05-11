import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import packageBookingService from '../services'
import { bookPackageSchema, type BookPackageFormValues } from '../validations'

export const useBookPackage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const methods = useForm<BookPackageFormValues>({
    defaultValues: {
      mentorPackageId: '',
      gatewayId: 'aa977b81-e134-4478-9fa2-5aea402057c5',
      bookedByProjectId: null,
      voucherCode: null,
      voucherIdempotencyKey: null
    },
    resolver: zodResolver(bookPackageSchema)
  })

  const { mutate: bookPackage, isPending: isBookingPackage } = useMutation({
    mutationFn: packageBookingService.bookPackage,
    onSuccess: (transactionId) => {
      navigate(`/payments/checkout?transactionId=${transactionId}`)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, bookPackage, isBookingPackage }
}
