import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'

export const useGetSortableCategories = () => {
  const { data: sortableCategories = [], isLoading: isLoadingSortableCategories } = useQuery({
    queryKey: ['categoryProducts', 'sortable'],
    queryFn: categoryService.getSortableCategories
  })

  return { sortableCategories, isLoadingSortableCategories }
}
