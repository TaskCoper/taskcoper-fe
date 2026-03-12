import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { addProjectRevenueSchema, type AddProjectRevenueFormValues } from '../validations'

export const useAddProjectRevenue = () => {
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueFormValues>({
    resolver: zodResolver(addProjectRevenueSchema(t))
  })

  return { methods }
}
