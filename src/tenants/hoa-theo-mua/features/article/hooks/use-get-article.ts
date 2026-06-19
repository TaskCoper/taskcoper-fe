import { useQuery } from '@tanstack/react-query'
import articleService from '../services'

export const useGetArticle = (id?: string) => {
  const {
    data: articleResponse,
    isError,
    error,
    isFetching,
    isLoading: isLoadingArticle
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleService.getArticle({ id }),
    enabled: !!id
  })

  return {
    article: articleResponse?.value,
    error,
    isError,
    isFetching,
    isLoadingArticle
  }
}
