import { useQuery } from '@tanstack/react-query'
import productService from '../../services'

export const useGetMaterials = ({ search, enabled = true }: { search?: string; enabled?: boolean } = {}) => {
  const { data: materialsPage, isLoading: isGettingMaterials } = useQuery({
    queryKey: ['materials', search],
    queryFn: () => productService.getMaterials({ search, page: 1, pageSize: 100 }),
    enabled
  })

  return { materials: materialsPage?.items ?? [], isGettingMaterials }
}
