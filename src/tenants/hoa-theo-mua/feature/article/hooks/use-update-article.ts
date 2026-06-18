import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import articleService from '../services'
import { addArticleSchema, type AddArticleForm } from '../validations'

export const useUpdateArticle = (id: string) => {
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

  const { mutate: updateArticle, isPending: isUpdatingArticle } = useMutation({
    mutationFn: ({ body }: { body: AddArticleForm }) => articleService.updateArticle({ id, body }),
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  const onSubmit: SubmitHandler<AddArticleForm> = (body) => {
    updateArticle({ body })
  }

  return { methods, onSubmit, updateArticle, isUpdatingArticle }
}
