import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { getApiErrorDetail } from '../api-error'
import { parseHashtags } from '../hashtags'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import type { SaveMarketingPostBody } from '../types'
import { createMarketingPostSchema, type CreateMarketingPostFormValues } from '../validations'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

export const useCreateMarketingPost = () => {
  const navigate = useNavigate()
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  // Bấm Lưu nhiều lần phải cập nhật đúng bài vừa tạo, không đẻ ra mỗi lần một bài mới
  const postIdRef = useRef<string | null>(null)

  const methods = useForm<CreateMarketingPostFormValues>({
    defaultValues: {
      title: '',
      content: '',
      hashtags: '',
      images: []
    },
    resolver: zodResolver(createMarketingPostSchema(t))
  })

  // Bước 1 chỉ lưu bài gốc. Chọn nền tảng và sinh nội dung là bước 2, đúng như backend
  // tách POST /posts và POST /posts/{id}/generate.
  const { mutate: saveMarketingPost, isPending: isCreatingMarketingPost } = useMutation({
    mutationFn: ({ body }: { body: SaveMarketingPostBody; shouldContinue: boolean }) =>
      postIdRef.current
        ? marketingPostService.updateMarketingPost({ id: postIdRef.current, body })
        : marketingPostService.createMarketingPost({ body }),
    onSuccess: (post, { shouldContinue }) => {
      postIdRef.current = post.basePostId
      queryClient.setQueryData(marketingPostKeys.detail(post.basePostId), post)
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })

      if (!shouldContinue) {
        toast.success(t('marketingPosts.create.saveSuccess'))
        navigate(POSTS_PATH)

        return
      }

      navigate(`${POSTS_PATH}/create/${post.basePostId}/platforms`)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), { description: getApiErrorDetail(error) })
    }
  })

  const buildBody = ({ hashtags, images, ...values }: CreateMarketingPostFormValues): SaveMarketingPostBody => ({
    ...values,
    // Backend nhận hashtag là một chuỗi, gửi mảng là hỏng - bỏ trống thì gửi null để xoá hẳn
    hashtag: parseHashtags(hashtags).join(' ') || null,
    images: images.map((image, index) => ({
      imageUrl: image.url,
      sortOrder: index + 1,
      width: image.width,
      height: image.height
    }))
  })

  const onSubmit: SubmitHandler<CreateMarketingPostFormValues> = (values) =>
    saveMarketingPost({ body: buildBody(values), shouldContinue: true })

  const onSave: SubmitHandler<CreateMarketingPostFormValues> = (values) =>
    saveMarketingPost({ body: buildBody(values), shouldContinue: false })

  return { methods, onSubmit, onSave, isCreatingMarketingPost }
}
