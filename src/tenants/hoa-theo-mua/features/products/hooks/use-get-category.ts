import { useQuery } from '@tanstack/react-query'
import { categoryProductService } from '../services'

export const useGetCategory = (id?: string) => {
  const {
    data: category,
    error,
    isError,
    isFetching,
    isLoading: isLoadingCategory
  } = useQuery({
    queryKey: ['categoryProduct', id],
    queryFn: () => categoryProductService.getCategory({ id }),
    enabled: !!id
  })

  return { category, error, isError, isFetching, isLoadingCategory }
}
