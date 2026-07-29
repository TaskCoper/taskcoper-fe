import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import categoryService from '../services'
import type { CategoryMetadata } from '../types'
import { categoryProductSchema, type CategoryProductFormValues } from '../validations'
import { categoryFormDefaultValues } from './use-add-category'
import { useGetCategory } from './use-get-category'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

/** `metaData` comes back as a JSON-encoded string (or null) — parse it defensively. */
const parseCategoryMetadata = (metaData: string | null): CategoryMetadata => {
  if (!metaData) return {}
  try {
    return JSON.parse(metaData) as CategoryMetadata
  } catch {
    return {}
  }
}

export const useUpdateCategory = (id?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const methods = useForm<CategoryProductFormValues>({
    defaultValues: categoryFormDefaultValues,
    resolver: zodResolver(categoryProductSchema(t))
  })

  const { category, isLoadingCategory } = useGetCategory(id)

  // Re-sync the form whenever the `['categoryProduct', id]` cache entry changes — on first load,
  // on switching to a different `id`, and after `onSettled` below refetches post-update.
  useEffect(() => {
    if (!category) return

    const metadata = parseCategoryMetadata(category.metaData)

    methods.reset({
      name: category.name ?? '',
      name_En: category.name_En ?? '',
      description: category.description ?? '',
      description_En: category.description_En ?? '',
      type: category.type,
      isActive: category.isActive,
      startTime: category.startTime,
      endTime: category.endTime,
      parentId: category.parentId ?? undefined,
      position: category.position ?? null,
      metaData: {
        filterByName: metadata.filterByName ?? false,
        filterByPrice: metadata.filterByPrice ?? false,
        isFilterable: metadata.isFilterable ?? false,
        rows: metadata.rows ?? 1,
        cols: metadata.cols ?? 4
      },
      page: category.page ?? []
    })
  }, [category, methods])

  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation({
    mutationFn: ({ body }: { body: CategoryProductFormValues }) => categoryService.updateCategory({ id, body }),
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

  return { methods, updateCategory, isUpdatingCategory, isLoadingCategory }
}
