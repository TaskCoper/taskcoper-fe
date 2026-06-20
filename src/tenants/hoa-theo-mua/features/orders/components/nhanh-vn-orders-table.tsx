import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/date'
import { cn } from '@/shared/utils'
import { ChevronDownIcon, ChevronRightIcon, PackageIcon } from 'lucide-react'
import { Fragment, useState } from 'react'
import type { NhanhVnOrder } from '../types'

interface NhanhVnOrdersTableProps {
  orders: NhanhVnOrder[]
  isLoading: boolean
}

export function NhanhVnOrdersTable({ orders, isLoading }: NhanhVnOrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-14 w-full rounded-lg' />
        ))}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <PackageIcon className='size-10 mb-3 opacity-40' />
        <p className='text-sm'>Không có đơn hàng nào</p>
      </div>
    )
  }

  return (
    <div className='rounded-lg border overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50 text-muted-foreground'>
            <tr>
              <th className='w-8' />
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>Mã đơn</th>
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>Người bán</th>
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>Nguồn</th>
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>Địa chỉ giao hàng</th>
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>SĐT</th>
              <th className='text-left px-3 py-3 font-medium whitespace-nowrap'>Vận chuyển</th>
              <th className='text-right px-3 py-3 font-medium whitespace-nowrap'>Thanh toán</th>
              <th className='text-right px-3 py-3 font-medium whitespace-nowrap'>Ngày tạo</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {orders.map((order) => {
              const isExpanded = expandedRows.has(order.info.id)
              const hasProducts = (order.products?.length ?? 0) > 0

              return (
                <Fragment key={order.info.id}>
                  <tr className={cn('hover:bg-muted/30 transition-colors', isExpanded && 'bg-muted/20')}>
                    <td className='px-2 py-3'>
                      {hasProducts && (
                        <button
                          onClick={() => toggleRow(order.info.id)}
                          className='flex items-center justify-center size-6 rounded hover:bg-muted transition-colors'
                          aria-label={isExpanded ? 'Thu gọn sản phẩm' : 'Xem sản phẩm'}
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className='size-4' />
                          ) : (
                            <ChevronRightIcon className='size-4' />
                          )}
                        </button>
                      )}
                    </td>
                    <td className='px-3 py-3'>
                      {order.info.trackingUrl ? (
                        <a
                          href={order.info.trackingUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline'
                        >
                          {order.info.id}
                        </a>
                      ) : (
                        <span className='font-mono text-xs'>{order.info.id}</span>
                      )}
                    </td>
                    <td className='px-3 py-3 whitespace-nowrap'>{order.info.saleName || '—'}</td>
                    <td className='px-3 py-3'>
                      {order.channel?.trafficSource ? (
                        <span className='text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-full whitespace-nowrap'>
                          {order.channel.trafficSource}
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </td>
                    <td className='px-3 py-3 max-w-52'>
                      <p className='truncate'>{order.shippingAddress?.address || '—'}</p>
                      {order.shippingAddress?.location && (
                        <p className='text-xs text-muted-foreground truncate'>{order.shippingAddress.location}</p>
                      )}
                    </td>
                    <td className='px-3 py-3 whitespace-nowrap'>{order.shippingAddress?.mobile || '—'}</td>
                    <td className='px-3 py-3 whitespace-nowrap'>{order.carrier?.name || '—'}</td>
                    <td className='px-3 py-3 text-right font-medium whitespace-nowrap'>
                      {order.payment?.transfer?.amount != null
                        ? order.payment.transfer.amount.toLocaleString('vi-VN') + ' ₫'
                        : '—'}
                    </td>
                    <td className='px-3 py-3 text-right whitespace-nowrap text-xs text-muted-foreground'>
                      {order.info.createdAt ? formatDateTime(order.info.createdAt, 'dateLong') : '—'}
                    </td>
                  </tr>

                  {isExpanded && hasProducts && (
                    <tr className='bg-muted/10'>
                      <td colSpan={9} className='px-4 pb-3 pt-1'>
                        <div className='rounded-md border overflow-hidden'>
                          <table className='w-full text-xs'>
                            <thead className='bg-muted/60'>
                              <tr>
                                <th className='text-left px-3 py-2 font-medium w-12'>Ảnh</th>
                                <th className='text-left px-3 py-2 font-medium'>Tên sản phẩm</th>
                                <th className='text-left px-3 py-2 font-medium'>Mã SP</th>
                                <th className='text-right px-3 py-2 font-medium'>SL</th>
                                <th className='text-right px-3 py-2 font-medium'>Đơn giá</th>
                                <th className='text-right px-3 py-2 font-medium'>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-border'>
                              {order.products.map((product, idx) => (
                                <tr key={idx} className='hover:bg-muted/20'>
                                  <td className='px-3 py-2'>
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className='size-9 object-cover rounded border'
                                      />
                                    ) : (
                                      <div className='size-9 rounded border bg-muted flex items-center justify-center'>
                                        <PackageIcon className='size-4 text-muted-foreground/50' />
                                      </div>
                                    )}
                                  </td>
                                  <td className='px-3 py-2 font-medium'>{product.name}</td>
                                  <td className='px-3 py-2 font-mono text-muted-foreground'>{product.code}</td>
                                  <td className='px-3 py-2 text-right'>{product.quantity}</td>
                                  <td className='px-3 py-2 text-right'>{product.price?.toLocaleString('vi-VN')} ₫</td>
                                  <td className='px-3 py-2 text-right font-medium'>
                                    {((product.price ?? 0) * (product.quantity ?? 0)).toLocaleString('vi-VN')} ₫
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
