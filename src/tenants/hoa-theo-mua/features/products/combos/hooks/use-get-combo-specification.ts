import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../../query-keys'
import productService from '../../services'

export const useGetComboSpecification = ({ id, enabled = true }: { id: string | number; enabled?: boolean }) => {
  const {
    data: comboSpecification,
    isLoading: isGettingComboSpecification,
    isError
  } = useQuery({
    queryKey: productKeys.comboSpecification(id),
    queryFn: () => productService.getComboSpecification({ id }),
    enabled: enabled && id !== '' && id != null
  })

  return { comboSpecification, isGettingComboSpecification, isError }
}
