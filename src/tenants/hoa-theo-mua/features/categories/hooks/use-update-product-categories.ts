import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorDescription } from '../../products/error-description'
import { productKeys } from '../../products/query-keys'
import type { Product } from '../../products/types'
import categoryService from '../services'
import { updateProductCategoriesSchema, type UpdateProductCategoriesFormValues } from '../validations'

const toFormValues = (product: Product): UpdateProductCategoriesFormValues => ({
  productId: product.id,
  categoryProductLists: product.categories.map((category, index) => ({
    categoryProductId: category.categoryId,
    isPin: category.isPinned,
    position: category.position ?? index
  }))
})

export const useUpdateProductCategories = (product?: Product) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<UpdateProductCategoriesFormValues>({
    resolver: zodResolver(updateProductCategoriesSchema),
    values: product ? toFormValues(product) : undefined
  })

  const { mutate: updateProductCategories, isPending: isUpdatingProductCategories } = useMutation({
    mutationFn: (body: UpdateProductCategoriesFormValues) => categoryService.updateProductCategories({ body }),
    onSuccess: (_data, body) => {
      toast.success(t('products.detail.categories.updated'))
      queryClient.invalidateQueries({ queryKey: productKeys.detail(body.productId) })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { methods, updateProductCategories, isUpdatingProductCategories }
}
