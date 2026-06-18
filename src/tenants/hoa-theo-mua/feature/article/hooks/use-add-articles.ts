import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import articleService from '../services'
import { addArticleSchema, type AddArticleForm } from '../validations'

export const useAddArticle = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<AddArticleForm>({
    defaultValues: {
      title: '',
      description: '',
      pictureUrl: '',
      status: 0,
      categories: []
    },
    resolver: zodResolver(addArticleSchema(t))
  })

  const { mutate: addArticle, isPending: isAddingArticle } = useMutation({
    mutationFn: articleService.addArticle,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  return { methods, addArticle, isAddingArticle }
}
