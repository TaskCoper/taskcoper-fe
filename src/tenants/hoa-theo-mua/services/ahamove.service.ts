import type { AhamoveServiceDetail } from '../types/ahamove.type'
import { BaseService } from './base.service'

class AhamoveService extends BaseService {
  private readonly baseUrl = 'ahamove'

  getService = async () => {
    const { data } = await this.get<AhamoveServiceDetail>(`/v1/${this.baseUrl}/service-details`)

    return data
  }
}

const ahamoveService = new AhamoveService()
export default ahamoveService
