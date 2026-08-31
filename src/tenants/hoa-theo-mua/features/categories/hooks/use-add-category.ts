import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import categoryService from '../services'
import { CategoryProductType } from '../types'
import { categoryProductSchema, type CategoryProductFormValues } from '../validations'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

export const categoryFormDefaultValues: CategoryProductFormValues = {
  name: '',
  name_En: '',
  description: '',
  description_En: '',
  type: CategoryProductType.Fix,
  isActive: true,
  startTime: null,
  endTime: null,
  parentId: undefined,
  position: null,
  metaData: {
    filterByName: false,
    filterByPrice: false,
    isFilterable: false,
    rows: 1,
    cols: 4
  },
  page: []
}

export const useAddCategory = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<CategoryProductFormValues>({
    defaultValues: categoryFormDefaultValues,
    resolver: zodResolver(categoryProductSchema(t))
  })

  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: categoryService.addCategory,
    onSuccess: () => {
      toast.success(t(`${CATEGORY_FORM_PREFIX}.createSuccess`))
      methods.reset(categoryFormDefaultValues)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
    }
  })

  return { methods, addCategory, isAddingCategory }
}
