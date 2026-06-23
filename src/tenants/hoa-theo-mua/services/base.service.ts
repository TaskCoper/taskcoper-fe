import api from '@/lib/axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export class BaseService {
  protected readonly prefix: string = '/ecommerce-api'

  private url(path: string) {
    return `${this.prefix}${path}`
  }

  protected get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.get<T>(this.url(path), config)
  }

  protected post<T = unknown, B = unknown>(
    path: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.post<T>(this.url(path), body, config)
  }

  protected put<T = unknown, B = unknown>(
    path: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.put<T>(this.url(path), body, config)
  }

  protected patch<T = unknown, B = unknown>(
    path: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return api.patch<T>(this.url(path), body, config)
  }

  protected delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.delete<T>(this.url(path), config)
  }
}
