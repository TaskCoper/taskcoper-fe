import { useQuery } from '@tanstack/react-query'
import companyAddressService from '../services'

export const useGetCompanyAddress = () => {
  const { data: companyAddress, isLoading: isLoadingCompanyAddress } = useQuery({
    queryKey: ['company-address'],
    queryFn: companyAddressService.getCompanyAddress
  })

  return { companyAddress, isLoadingCompanyAddress }
}
