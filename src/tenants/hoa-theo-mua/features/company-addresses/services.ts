import type { BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { CompanyAddress } from './types'
import type { CreateCompanyAddressFormValues, UpdateCompanyAddressFormValues } from './validations'

class CompanyAddressService {
  private readonly baseUrl = 'company-addresses'

  getCompanyAddress = async () => {
    const { data } = await htmApi.get<BaseResponse<CompanyAddress | null>>(`/v1/${this.baseUrl}`)

    return data.value
  }

  createCompanyAddress = async ({
    body
  }: {
    body: Pick<
      CreateCompanyAddressFormValues,
      'addressLine' | 'city' | 'ward' | 'latitude' | 'longitude' | 'mapId' | 'country'
    >
  }) => {
    const { data } = await htmApi.post<BaseResponse<CompanyAddress>>(`/v1/${this.baseUrl}`, {
      addressLine: body.addressLine,
      city: body.city,
      ward: body.ward,
      latitude: body.latitude,
      longitude: body.longitude,
      mapId: body.mapId,
      country: body.country
    })

    return data.value
  }

  updateCompanyAddress = async ({
    id,
    body
  }: {
    id: string
    body: Pick<
      UpdateCompanyAddressFormValues,
      'addressLine' | 'city' | 'ward' | 'latitude' | 'longitude' | 'mapId' | 'country'
    >
  }) => {
    const { data } = await htmApi.put<BaseResponse<CompanyAddress>>(`/v1/${this.baseUrl}/${id}`, {
      addressLine: body.addressLine,
      city: body.city,
      ward: body.ward,
      latitude: body.latitude,
      longitude: body.longitude,
      mapId: body.mapId,
      country: body.country
    })

    return data.value
  }
}

const companyAddressService = new CompanyAddressService()
export default companyAddressService
