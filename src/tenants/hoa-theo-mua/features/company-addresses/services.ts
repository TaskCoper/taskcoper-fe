import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { CompanyAddress } from './types'
import type { CreateCompanyAddressFormValues, UpdateCompanyAddressFormValues } from './validations'

type CompanyAddressPayloadKeys =
  | 'fullName'
  | 'phone'
  | 'remarks'
  | 'addressLine'
  | 'city'
  | 'ward'
  | 'latitude'
  | 'longitude'
  | 'mapId'
  | 'country'

class CompanyAddressService extends BaseService {
  private readonly baseUrl = 'company-addresses'

  getCompanyAddress = async () => {
    const { data } = await this.get<BaseResponse<CompanyAddress | null>>(`/v1/${this.baseUrl}`)

    return data.value
  }

  createCompanyAddress = async ({
    body
  }: {
    body: Pick<CreateCompanyAddressFormValues, CompanyAddressPayloadKeys>
  }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, {
      fullName: body.fullName,
      phone: body.phone,
      remarks: body.remarks,
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
    body: Pick<UpdateCompanyAddressFormValues, CompanyAddressPayloadKeys>
  }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, {
      fullName: body.fullName,
      phone: body.phone,
      remarks: body.remarks,
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
