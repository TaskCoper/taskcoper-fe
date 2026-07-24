import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { categoryProductService } from '../services'
import { categoryProductSchema, type CategoryProductFormValues } from '../validations'
import { categoryFormDefaultValues } from './use-add-category'
import { getErrorDescription } from './error-description'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

export const useUpdateCategory = (id?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<CategoryProductFormValues>({
    defaultValues: categoryFormDefaultValues,
    resolver: zodResolver(categoryProductSchema(t))
  })

  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation({
    mutationFn: ({ body }: { body: CategoryProductFormValues }) => categoryProductService.updateCategory({ id, body }),
    onSuccess: () => {
      toast.success(t(`${CATEGORY_FORM_PREFIX}.updateSuccess`))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
      queryClient.invalidateQueries({ queryKey: ['categoryProduct', id] })
    }
  })

  return { methods, updateCategory, isUpdatingCategory }
}
