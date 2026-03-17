import type { BookPackageFormValues } from '@/features/package-bookings/validations'
import { api, type BaseResponse } from '@/lib/axios'

class PackageBookingService {
  private readonly baseUrl = 'package-bookings'

  bookPackage = async ({ body }: { body: BookPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<{ transactionId: string }>>(`/v1/${this.baseUrl}`, body)

    return data.value.transactionId
  }
}

const packageBookingService = new PackageBookingService()
export default packageBookingService
