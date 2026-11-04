import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import z from 'zod'
import { importDetailSchema, importSettingsSchema, importSummarySchema, type ImportSettings } from './types'

class PostImportService extends BaseService {
  private readonly path = '/v1/post-imports'

  defaults = async () => {
    const { data } = await this.get<BaseResponse<unknown>>(`${this.path}/defaults`)
    return importSettingsSchema.parse(data.value)
  }
  saveDefaults = async (input: ImportSettings) => {
    const { data } = await this.put<BaseResponse<unknown>, ImportSettings>(
      `${this.path}/defaults`,
      importSettingsSchema.parse(input)
    )
    return importSettingsSchema.parse(data.value)
  }
  import = async ({
    file,
    requestKey,
    onProgress
  }: {
    file: File
    requestKey: string
    onProgress?: (percent: number | null) => void
  }) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await this.post<BaseResponse<unknown>, FormData>(this.path, form, {
      headers: { 'Content-Type': undefined, 'Idempotency-Key': requestKey },
      timeout: 90000,
      onUploadProgress: ({ loaded, total }) =>
        onProgress?.(total ? Math.min(100, Math.round((loaded / total) * 100)) : null)
    })
    return importSummarySchema.parse(data.value)
  }
  list = async () => {
    const { data } = await this.get<BaseResponse<unknown>>(this.path)
    return z.array(importSummarySchema).parse(data.value)
  }
  detail = async (id: string, pageIndex: number) => {
    const { data } = await this.get<BaseResponse<unknown>>(`${this.path}/${id}`, {
      params: { pageIndex, pageSize: 50 }
    })
    return importDetailSchema.parse(data.value)
  }
  export = async (id: string) => {
    const { data } = await this.get<Blob>(`${this.path}/${id}/export`, { responseType: 'blob', timeout: 60000 })
    return data
  }
}

export default new PostImportService()
