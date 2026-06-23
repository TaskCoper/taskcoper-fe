import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { CompanyAddress } from './types'
import type { CreateCompanyAddressFormValues, UpdateCompanyAddressFormValues } from './validations'

class CompanyAddressService extends BaseService {
  private readonly baseUrl = 'company-addresses'

  getCompanyAddress = async () => {
    const { data } = await this.get<BaseResponse<CompanyAddress | null>>(`/v1/${this.baseUrl}`)

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
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
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
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, {
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
