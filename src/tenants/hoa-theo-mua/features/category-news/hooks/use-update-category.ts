import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import newsCategoryService from '../services'
import { addCategorySchema, type AddCategoryFormValues } from '../validations'
import { getErrorDescription, getResponseMessage } from './error-description'

const ARTICLE_CATEGORY_FORM_PREFIX = 'articleCategories.form' as const

export const useUpdateCategory = (id?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<AddCategoryFormValues>({
    defaultValues: {
      title: '',
      parentId: undefined
    },
    resolver: zodResolver(addCategorySchema(t))
  })

  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation({
    mutationFn: ({ body }: { body: AddCategoryFormValues }) => newsCategoryService.updateNewsCategory({ id, body }),
    onSuccess: (message) => {
      toast.success(getResponseMessage(message) || t(`${ARTICLE_CATEGORY_FORM_PREFIX}.updateSuccess`))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categoriesNews'] })
      queryClient.invalidateQueries({ queryKey: ['categoryNews', id] })
    }
  })

  const onSubmit: SubmitHandler<AddCategoryFormValues> = (body) => {
    updateCategory({ body })
  }

  return { methods, onSubmit, updateCategory, isUpdatingCategory }
}
