import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PackageIcon } from 'lucide-react'
import type { NhanhVnOrder } from '../types'
import { vndFormatter } from '../utils'

export function NhanhVnProductsSubRow({ row }: { row: { original: NhanhVnOrder } }) {
  const { t } = useTenantTranslation()

  const products = row.original.products ?? []
  if (!products.length) return null

  return (
    <div className='px-4 py-3'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='text-muted-foreground text-sm font-medium w-14'>
              {t('orders.productTable.image')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>{t('orders.productTable.name')}</TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium'>{t('orders.productTable.sku')}</TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.quantity')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.unitPrice')}
            </TableHead>
            <TableHead className='text-muted-foreground text-sm font-medium text-right'>
              {t('orders.productTable.total')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, idx) => (
            <TableRow key={idx} className='text-sm'>
              <TableCell>
                {product.image ? (
                  <img src={product.image} alt={product.name} className='size-10 object-cover rounded-md border' />
                ) : (
                  <div className='size-10 rounded border bg-muted flex items-center justify-center'>
                    <PackageIcon className='size-10 text-muted-foreground/40' />
                  </div>
                )}
              </TableCell>
              <TableCell className='font-medium'>{product.name}</TableCell>
              <TableCell className='font-mono text-muted-foreground'>{product.code}</TableCell>
              <TableCell className='text-right'>{product.quantity}</TableCell>
              <TableCell className='text-right'>
                {product.price != null ? vndFormatter.format(product.price) : null}
              </TableCell>
              <TableCell className='text-right font-medium'>
                {vndFormatter.format((product.price ?? 0) * (product.quantity ?? 0))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
