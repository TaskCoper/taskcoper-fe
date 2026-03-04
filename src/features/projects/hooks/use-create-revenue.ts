import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { createRevenueSchema, type CreateRevenueFormValues } from '../validations'

const defaultValues: CreateRevenueFormValues = {
  name: '',
  type: 'income',
  amount: 0,
  note: ''
}

export const useCreateRevenue = () => {
  const { t } = useTranslation()

  const methods = useForm<CreateRevenueFormValues>({
    defaultValues,
    resolver: zodResolver(createRevenueSchema(t))
  })

  // TODO: thêm useMutation khi có API
  const createRevenue = (data: CreateRevenueFormValues) => {
    console.log('TODO: call API', data)
  }
  const isCreatingRevenue = false

  return { methods, createRevenue, isCreatingRevenue }
}
