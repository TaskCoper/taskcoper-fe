import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import newsCategoryService from '../services'
import { addCategorySchema, type AddCategoryFormValues } from '../validations'
import { getErrorDescription } from './error-description'

const ARTICLE_CATEGORY_FORM_PREFIX = 'articleCategories.form' as const

export const useAddCategory = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<AddCategoryFormValues>({
    defaultValues: {
      title: '',
      parentId: undefined
    },
    resolver: zodResolver(addCategorySchema(t))
  })

  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: newsCategoryService.addNewsCategory,
    onSuccess: () => {
      toast.success(t(`${ARTICLE_CATEGORY_FORM_PREFIX}.createSuccess`))
      methods.reset()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: t(`${ARTICLE_CATEGORY_FORM_PREFIX}.createError `) + getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categoriesNews'] })
    }
  })

  return { methods, addCategory, isAddingCategory }
}
