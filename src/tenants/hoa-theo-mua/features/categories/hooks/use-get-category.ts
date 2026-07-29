import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'

export const useGetCategory = (id?: string) => {
  const {
    data: category,
    error,
    isError,
    isFetching,
    isLoading: isLoadingCategory
  } = useQuery({
    queryKey: ['categoryProduct', id],
    queryFn: () => categoryService.getCategory({ id }),
    enabled: !!id
  })

  return { category, error, isError, isFetching, isLoadingCategory }
}
